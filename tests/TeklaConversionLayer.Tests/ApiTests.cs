using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TeklaConversionLayer;

namespace TeklaConversionLayer.Tests;

public class ApiTests
{
    const string Token = "test-token-0123456789abcdef0123456789";

    static (WebApplicationFactory<Program> Factory, HttpClient Client) Start(bool allowWrites)
    {
        var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
        {
            b.UseSetting("API_TOKEN", Token);
            b.UseSetting("POWERFAB_MODE", "mock");
            b.UseSetting("POWERFAB_ALLOW_WRITES", allowWrites.ToString());
        });
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token);
        return (factory, client);
    }

    [Fact]
    public async Task Health_needs_no_token()
    {
        var (factory, _) = Start(allowWrites: false);
        var response = await factory.CreateClient().GetFromJsonAsync<JsonObject>("/health");
        Assert.Equal("mock", (string?)response!["mode"]);
    }

    [Fact]
    public async Task Api_rejects_missing_or_wrong_token()
    {
        var (factory, _) = Start(allowWrites: false);
        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/jobs/J1/loads")).StatusCode);

        anonymous.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "wrong");
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/jobs/J1/loads")).StatusCode);
    }

    [Fact]
    public async Task Writes_are_blocked_unless_enabled()
    {
        var (_, client) = Start(allowWrites: false);
        var load = await client.PostAsJsonAsync("/api/jobs/J1/trucks/1/pieces", new { mainMark = "1001-C1" });
        Assert.Equal(HttpStatusCode.Forbidden, load.StatusCode);

        var passthroughWrite = await client.PostAsJsonAsync("/api/powerfab/Ship", new { JobNumber = "J1" });
        Assert.Equal(HttpStatusCode.Forbidden, passthroughWrite.StatusCode);

        var passthroughRead = await client.PostAsJsonAsync("/api/powerfab/GetLoads", new { JobNumber = "J1" });
        Assert.Equal(HttpStatusCode.OK, passthroughRead.StatusCode);
    }

    [Fact]
    public async Task Load_unload_and_ship_a_truck()
    {
        var (_, client) = Start(allowWrites: true);

        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/jobs/J1/trucks/7/pieces", new { mainMark = "1001-C1", quantity = 2, sequence = "1" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/jobs/J1/trucks/7/pieces", new { mainMark = "1002-B1", sequence = "1" })).StatusCode);

        var unload = new HttpRequestMessage(HttpMethod.Delete, "/api/jobs/J1/trucks/7/pieces")
        {
            Content = JsonContent.Create(new { mainMark = "1001-C1", quantity = 1, sequence = "1" }),
        };
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(unload)).StatusCode);

        var loads = await client.GetFromJsonAsync<JsonObject>("/api/jobs/J1/loads");
        var material = loads!["Load"]!["Material"]!.AsArray();
        Assert.Equal("1", (string?)material.Single(m => (string?)m!["MainMark"] == "1001-C1")!["Quantity"]);
        Assert.Equal("1", (string?)material.Single(m => (string?)m!["MainMark"] == "1002-B1")!["Quantity"]);

        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/jobs/J1/trucks/7/ship", new { date = "2026-10-19" })).StatusCode);

        var lateLoad = await client.PostAsJsonAsync("/api/jobs/J1/trucks/7/pieces", new { mainMark = "1003-W2" });
        Assert.Equal(HttpStatusCode.UnprocessableEntity, lateLoad.StatusCode);
        Assert.Contains("already shipped", await lateLoad.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Reconnects_when_the_powerfab_session_expires()
    {
        var (factory, client) = Start(allowWrites: false);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/jobs/J1/loads")).StatusCode);

        factory.Services.GetRequiredService<MockPowerFab>().ExpireSessions();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/jobs/J1/loads")).StatusCode);
    }

    [Fact]
    public async Task Invalid_field_names_are_rejected()
    {
        var (_, client) = Start(allowWrites: false);
        var response = await client.PostAsJsonAsync("/api/powerfab/GetLoads", new JsonObject { ["bad name"] = "x" });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
