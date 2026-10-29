using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace TeklaConversionLayer.Tests;

public sealed class FileTests : IDisposable
{
    const string Token = "test-token-0123456789abcdef0123456789";
    static readonly byte[] Jpeg = [0xFF, 0xD8, 0xFF, 0xE0, 0, 0x10, (byte)'J', (byte)'F', (byte)'I', (byte)'F', 0, 1, 2, 3];
    static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0];

    readonly string dir = Directory.CreateTempSubdirectory("tcl-files-").FullName;
    string Root => Path.Combine(dir, "root");
    string Rules => Path.Combine(dir, "file-rules.json");

    public void Dispose() => Directory.Delete(dir, recursive: true);

    HttpClient Start(bool enabled = true, string maxMb = "1", string? types = null)
    {
        var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
        {
            b.UseSetting("API_TOKEN", Token);
            b.UseSetting("POWERFAB_MODE", "mock");
            b.UseSetting("FILES_ENABLED", enabled.ToString());
            b.UseSetting("FILES_ROOT", Root);
            b.UseSetting("FILES_RULES", Rules);
            b.UseSetting("FILES_MAX_MB", maxMb);
            b.UseSetting("FILES_MAX_PER_UPLOAD", "3");
            if (types is not null)
                b.UseSetting("FILES_TYPES", types);
        });
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token);
        return client;
    }

    static MultipartFormDataContent Form(string? mark, params byte[][] files)
    {
        var form = new MultipartFormDataContent();
        foreach (var (bytes, i) in files.Select((f, i) => (f, i)))
            form.Add(new ByteArrayContent(bytes) { Headers = { ContentType = new("image/jpeg") } }, "file", $"IMG_{i}.JPG");
        if (mark is not null)
            form.Add(new StringContent(mark), "mark");
        return form;
    }

    [Fact]
    public async Task Photos_go_in_a_folder_per_job_then_per_load()
    {
        var client = Start();
        var response = await client.PostAsync("/api/files/EPM-001/8", Form(null, Jpeg, Png));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var saved = (await response.Content.ReadFromJsonAsync<JsonObject>())!["saved"]!.AsArray();
        Assert.Equal(2, saved.Count);

        var folder = Path.Combine(Root, "EPM-001", "8");
        var names = Directory.GetFiles(folder).Select(Path.GetFileName).Order().ToArray();
        Assert.Equal(2, names.Length);
        Assert.Matches(@"^\d{8}-\d{6}_load\.jpg$", names.Single(n => n!.EndsWith(".jpg")));
        Assert.Matches(@"^\d{8}-\d{6}_load\.png$", names.Single(n => n!.EndsWith(".png")));

        await client.PostAsync("/api/files/EPM-001/8", Form("1001-C1", Jpeg));
        var listed = await client.GetFromJsonAsync<JsonObject>("/api/files/EPM-001/8");
        Assert.Equal(3, listed!["files"]!.AsArray().Count);
        Assert.Contains(listed["files"]!.AsArray(), f => ((string)f!["name"]!).EndsWith("_1001-C1.jpg"));
    }

    [Fact]
    public async Task Saved_files_can_be_viewed_and_deleted_into_a_deleted_folder()
    {
        var client = Start();
        var saved = await (await client.PostAsync("/api/files/J1/8", Form("1001-C1", Jpeg))).Content.ReadFromJsonAsync<JsonObject>();
        var name = (string)saved!["saved"]![0]!["name"]!;

        var view = await client.GetAsync($"/api/files/J1/8/{Uri.EscapeDataString(name)}");
        Assert.Equal(HttpStatusCode.OK, view.StatusCode);
        Assert.Equal("image/jpeg", view.Content.Headers.ContentType!.MediaType);
        Assert.Equal(Jpeg, await view.Content.ReadAsByteArrayAsync());
        Assert.Contains("nosniff", view.Headers.GetValues("X-Content-Type-Options"));

        var deleted = await client.DeleteAsync($"/api/files/J1/8/{Uri.EscapeDataString(name)}");
        Assert.Equal(HttpStatusCode.OK, deleted.StatusCode);
        Assert.Empty((await client.GetFromJsonAsync<JsonObject>("/api/files/J1/8"))!["files"]!.AsArray());
        Assert.True(File.Exists(Path.Combine(Root, "J1", "8", ".deleted", name)));
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/files/J1/8/{Uri.EscapeDataString(name)}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/files/J1/8/{Uri.EscapeDataString(name)}")).StatusCode);

        // The same name deleted twice keeps both copies.
        File.Copy(Path.Combine(Root, "J1", "8", ".deleted", name), Path.Combine(Root, "J1", "8", name));
        Assert.Equal(HttpStatusCode.OK, (await client.DeleteAsync($"/api/files/J1/8/{Uri.EscapeDataString(name)}")).StatusCode);
        Assert.Equal(2, Directory.GetFiles(Path.Combine(Root, "J1", "8", ".deleted")).Length);
    }

    [Theory]
    [InlineData("..")]
    [InlineData(".deleted")]
    [InlineData("..%5Cx.jpg")]
    [InlineData("a%3Ab.jpg")]
    [InlineData(".upload-x.tmp")]
    public async Task View_and_delete_only_take_a_plain_file_name(string name)
    {
        var client = Start();
        await client.PostAsync("/api/files/J1/8", Form(null, Jpeg));
        File.WriteAllText(Path.Combine(dir, "outside.jpg"), "x");
        foreach (var response in new[] { await client.GetAsync($"/api/files/J1/8/{name}"), await client.DeleteAsync($"/api/files/J1/8/{name}") })
            Assert.True(response.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.NotFound or HttpStatusCode.MethodNotAllowed, $"{name}: {response.StatusCode}");
        Assert.Single(Directory.GetFiles(Path.Combine(Root, "J1", "8")));
        Assert.True(File.Exists(Path.Combine(dir, "outside.jpg")));
    }

    [Fact]
    public async Task View_and_delete_need_files_on_and_the_key()
    {
        var off = Start(enabled: false);
        Assert.Equal(HttpStatusCode.Forbidden, (await off.GetAsync("/api/files/J1/8/a.jpg")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await off.DeleteAsync("/api/files/J1/8/a.jpg")).StatusCode);
        var on = Start();
        on.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "wrong");
        Assert.Equal(HttpStatusCode.Unauthorized, (await on.DeleteAsync("/api/files/J1/8/a.jpg")).StatusCode);
    }

    [Fact]
    public async Task Same_second_uploads_never_overwrite()
    {
        var client = Start();
        await client.PostAsync("/api/files/J1/1", Form("A", Jpeg, Jpeg, Jpeg));
        Assert.Equal(3, Directory.GetFiles(Path.Combine(Root, "J1", "1")).Length);
    }

    [Fact]
    public async Task Regex_rules_pick_the_job_folder()
    {
        var special = Path.Combine(dir, "special");
        var byYear = Path.Combine(dir, "years");
        var fallback = Path.Combine(dir, "fallback");
        File.WriteAllText(Rules, new JsonObject
        {
            ["default"] = Path.Combine(fallback, "{job}"),
            ["loadFolder"] = "Load {load}",
            ["rules"] = new JsonArray(
                new JsonObject { ["match"] = "^epm-", ["folder"] = Path.Combine(special, "EPM jobs", "{job}") },
                new JsonObject { ["match"] = @"^(?<year>\d{2})(\d{3})$", ["folder"] = Path.Combine(byYear, "20{year}", "{1} ({job})") }),
        }.ToJsonString());

        var client = Start();
        foreach (var url in new[] { "/api/files/EPM-001/8", "/api/files/26101/3" })
        {
            var r = await client.PostAsync(url, Form(null, Jpeg));
            Assert.True(r.StatusCode == HttpStatusCode.Created, await r.Content.ReadAsStringAsync());
        }
        Assert.Equal(HttpStatusCode.Created, (await client.PostAsync("/api/files/X-9/1", Form(null, Jpeg))).StatusCode);

        Assert.Single(Directory.GetFiles(Path.Combine(special, "EPM jobs", "EPM-001", "Load 8")));
        Assert.Single(Directory.GetFiles(Path.Combine(byYear, "2026", "101 (26101)", "Load 3")));
        Assert.Single(Directory.GetFiles(Path.Combine(fallback, "X-9", "Load 1")));
        Assert.False(Directory.Exists(Root));
    }

    [Fact]
    public async Task A_broken_rules_file_saves_nothing_and_says_why()
    {
        File.WriteAllText(Rules, """{ "rules": [ { "match": "([", "folder": "C:\\x" } ] }""");
        var client = Start();
        var response = await client.PostAsync("/api/files/J1/1", Form(null, Jpeg));
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Contains("valid regex", await response.Content.ReadAsStringAsync());

        File.WriteAllText(Rules, """{ "rules": [ { "match": ".", "folder": "relative\\{job}" } ] }""");
        File.SetLastWriteTimeUtc(Rules, DateTime.UtcNow.AddMinutes(1));
        response = await client.GetAsync("/api/files/J1/1");
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Contains("full path", await response.Content.ReadAsStringAsync());
        Assert.False(Directory.Exists(Root));
    }

    [Theory]
    [InlineData("..", "1")]
    [InlineData("J1", "..")]
    [InlineData("..%5C..%5Cwin", "1")]
    [InlineData("J1", "..%5C..")]
    [InlineData("J1", "a%3Ab")]
    [InlineData("CON", "1")]
    [InlineData("J1.", "1")]
    [InlineData("%20J1", "1")]
    [InlineData("J1", "a%7Cb")]
    [InlineData("J1", "a%2A")]
    public async Task Names_that_could_leave_the_folder_are_refused(string job, string load)
    {
        var client = Start();
        var response = await client.PostAsync($"/api/files/{job}/{load}", Form(null, Jpeg));
        // ".." in a URL is folded away before routing, so it can't reach the route at all (404/405).
        Assert.True(response.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.NotFound or HttpStatusCode.MethodNotAllowed, $"{job}/{load}: {response.StatusCode}");
        Assert.Empty(Directory.EnumerateFileSystemEntries(dir, "*", SearchOption.AllDirectories));
    }

    [Fact]
    public async Task An_encoded_slash_stays_a_literal_character_in_one_folder_name()
    {
        // ASP.NET Core leaves %2F undecoded in a route value, so it can't split the path.
        var client = Start();
        Assert.Equal(HttpStatusCode.Created, (await client.PostAsync("/api/files/..%2F..%2Fetc/1", Form(null, Jpeg))).StatusCode);
        Assert.Single(Directory.GetFiles(Path.Combine(Root, "..%2F..%2Fetc", "1")));
        Assert.Equal([Root], Directory.GetDirectories(dir));
    }

    [Fact]
    public async Task A_bad_mark_is_refused()
    {
        var client = Start();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsync("/api/files/J1/1", Form("../x", Jpeg))).StatusCode);
        Assert.False(Directory.Exists(Root));
    }

    [Fact]
    public async Task Size_count_and_type_are_limited_before_anything_is_saved()
    {
        var client = Start(maxMb: "0.001", types: "jpg");
        var big = Jpeg.Concat(new byte[2000]).ToArray();
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, (await client.PostAsync("/api/files/J1/1", Form(null, Jpeg, big))).StatusCode);
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, (await client.PostAsync("/api/files/J1/1", Form(null, Jpeg, Png))).StatusCode);
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, (await client.PostAsync("/api/files/J1/1", Form(null, "<html>"u8.ToArray()))).StatusCode);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, (await client.PostAsync("/api/files/J1/1", Form(null, Jpeg, Jpeg, Jpeg, Jpeg))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsync("/api/files/J1/1", Form("A"))).StatusCode);
        Assert.False(Directory.Exists(Root));
    }

    [Fact]
    public async Task Off_by_default_and_needs_the_key()
    {
        var off = Start(enabled: false);
        Assert.Equal(HttpStatusCode.Forbidden, (await off.PostAsync("/api/files/J1/1", Form(null, Jpeg))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await off.GetAsync("/api/files/J1/1")).StatusCode);
        var status = await off.GetFromJsonAsync<JsonObject>("/api/files");
        Assert.False((bool)status!["enabled"]!);
        var help = await off.GetStringAsync("/api/files/help");
        Assert.Contains("file-rules.json", help);

        var on = Start();
        on.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "wrong");
        Assert.Equal(HttpStatusCode.Unauthorized, (await on.PostAsync("/api/files/J1/1", Form(null, Jpeg))).StatusCode);
        Assert.False(Directory.Exists(Root));
    }

    [Fact]
    public void Turning_files_on_needs_a_full_root_path()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["FILES_ENABLED"] = "true",
            ["FILES_ROOT"] = "relative",
        }).Build();
        Assert.Throws<InvalidOperationException>(() => FileSettings.From(config));
        Assert.False(FileSettings.From(new ConfigurationBuilder().Build()).Enabled);
    }

    [Fact]
    public void The_shipped_example_rules_file_parses()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "file-rules.example.json");
        var rules = FileStore.FileRules.Parse(File.ReadAllText(path), path);
        Assert.Equal("Load {load}", rules.LoadFolder);
        Assert.Equal(3, rules.Rules.Count);
        Assert.Matches(rules.Rules[1].Regex, "26101");
        Assert.True(File.Exists(Path.Combine(AppContext.BaseDirectory, "FILES.md")));
    }

    [Theory]
    [InlineData(new byte[] { 0xFF, 0xD8, 0xFF, 0xE1 }, "jpg")]
    [InlineData(new byte[] { 0, 0, 0, 0x18, (byte)'f', (byte)'t', (byte)'y', (byte)'p', (byte)'h', (byte)'e', (byte)'i', (byte)'c' }, "heic")]
    [InlineData(new byte[] { (byte)'%', (byte)'P', (byte)'D', (byte)'F', (byte)'-', (byte)'1' }, "pdf")]
    [InlineData(new byte[] { (byte)'M', (byte)'Z' }, null)]
    public void Types_are_read_from_the_first_bytes(byte[] head, string? type) =>
        Assert.Equal(type, FileStore.Sniff(head));
}
