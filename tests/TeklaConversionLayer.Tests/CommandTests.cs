using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TeklaConversionLayer.Tests;

public class CommandTests
{
    const string Token = "test-token-0123456789abcdef0123456789";

    static HttpClient Start(bool allowWrites, bool withToken = true)
    {
        var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
        {
            b.UseSetting("API_TOKEN", Token);
            b.UseSetting("POWERFAB_MODE", "mock");
            b.UseSetting("POWERFAB_ALLOW_WRITES", allowWrites.ToString());
        });
        var client = factory.CreateClient();
        if (withToken) client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token);
        return client;
    }

    [Fact]
    public void Table_has_every_documented_command_once_and_no_session_commands()
    {
        var names = PowerFabCommands.All.Select(c => c.Name).ToList();
        // 257 properties in Tekla's 2026 reference, less Connect, ConnectRemote, Close, CloseRemote and ConnectionGUID.
        Assert.Equal(252, names.Count);
        Assert.Equal(names.Count, names.Distinct().Count());
        Assert.Empty(names.Intersect(PowerFabCommands.SessionCommands));
    }

    [Theory]
    [InlineData("GetProductionControlJobs", CommandAccess.Read)]
    [InlineData("ProductionControlLoad_Get", CommandAccess.Read)]
    [InlineData("ValTruck", CommandAccess.Read)]
    [InlineData("MaxTruck", CommandAccess.Read)]
    [InlineData("ProductionControlLoad_IsDuplicateLoadNumber", CommandAccess.Read)]
    [InlineData("Load", CommandAccess.Write)]
    [InlineData("Ship", CommandAccess.Write)]
    [InlineData("ProductionControlLoad_Ship", CommandAccess.Write)]
    [InlineData("Firm_Upsert", null)]
    [InlineData("ExportJob", CommandAccess.Write)]
    [InlineData("TrimbleIdentityToken", CommandAccess.Write)]
    public void Commands_are_classified(string name, CommandAccess? expected) =>
        Assert.Equal(expected, PowerFabCommands.Find(name)?.Access);

    [Fact]
    public async Task Index_lists_every_command_and_needs_a_token()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await Start(false, withToken: false).GetAsync("/api/commands")).StatusCode);

        var index = await Start(false).GetFromJsonAsync<JsonArray>("/api/commands");
        Assert.Equal(PowerFabCommands.All.Count, index!.Count);
        var ship = index.Single(c => (string?)c!["name"] == "Ship")!;
        Assert.Equal("write", (string?)ship["access"]);
        Assert.False((bool)ship["enabled"]!);
    }

    [Fact]
    public async Task Every_command_route_needs_a_token()
    {
        var anonymous = Start(false, withToken: false);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/commands/GetProductionControlJobs")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/api/commands/Firm_Insert", new { })).StatusCode);
    }

    [Fact]
    public async Task Every_write_route_is_blocked_unless_writes_are_enabled()
    {
        var client = Start(allowWrites: false);
        foreach (var command in PowerFabCommands.All.Where(c => c.IsWrite))
        {
            var response = await client.PostAsJsonAsync($"/api/commands/{command.Name}", new { });
            Assert.True(response.StatusCode == HttpStatusCode.Forbidden, $"{command.Name} was not blocked");
        }
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/powerfab/Firm_Insert", new { })).StatusCode);
    }

    [Fact]
    public async Task Writes_go_through_when_enabled()
    {
        var response = await Start(allowWrites: true).PostAsJsonAsync("/api/commands/Firm_Insert", new { Name = "Test" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Reads_work_by_get_and_post_and_mock_replies_are_marked()
    {
        var client = Start(allowWrites: false);
        var byGet = await client.GetFromJsonAsync<JsonObject>("/api/commands/GetProductionControlJobs?JobNumber=25-351");
        Assert.Equal("true", (string?)byGet!["MockResponse"]);

        var byPost = await client.PostAsJsonAsync("/api/commands/ProductionControlLoad_Get", new { JobNumber = "25-351" });
        Assert.Equal(HttpStatusCode.OK, byPost.StatusCode);

        // A table read is no longer blocked by the pass-through's "starts with Get" rule.
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/powerfab/Firm_Get", new { })).StatusCode);
    }

    [Fact]
    public async Task Writes_have_no_get_route_and_unknown_commands_have_no_route()
    {
        var client = Start(allowWrites: true);
        Assert.Equal(HttpStatusCode.MethodNotAllowed, (await client.GetAsync("/api/commands/Ship")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/commands/NotACommand", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/commands/ConnectRemote", new { })).StatusCode);
    }
}
