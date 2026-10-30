using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using TeklaConversionLayer;
using TeklaPowerFab.TeklaPowerFabAPI;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // A Windows service starts in System32, so anchor everything to the install folder.
    ContentRootPath = AppContext.BaseDirectory,
});
builder.Host.UseWindowsService();
// Same keys as .env.example. Used when running as a Windows service, where there is no .env file.
builder.Configuration.AddJsonFile("local.settings.json", optional: true, reloadOnChange: false);
var settings = Settings.From(builder.Configuration);

builder.Services.AddSingleton(settings);
builder.Services.AddSingleton<MockPowerFab>();
builder.Services.AddSingleton(sp =>
{
    if (settings.MockMode)
        return new PowerFabClient(sp.GetRequiredService<MockPowerFab>().Execute, "mock", "mock");

    ITeklaPowerFabAPI api = new TeklaPowerFabAPI();
    return new PowerFabClient(xml => api.ExecuteRemote(settings.Host, settings.Port, xml), settings.Username, settings.Password);
});
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(settings.CorsOrigins).WithHeaders("Authorization", "Content-Type").WithMethods("GET", "POST", "DELETE")));

var app = builder.Build();
app.UseCors();

app.MapGet("/health", () => new { status = "ok", mode = settings.MockMode ? "mock" : "remote", writesEnabled = settings.AllowWrites });

var api = app.MapGroup("/api").AddEndpointFilter(async (context, next) =>
{
    var header = context.HttpContext.Request.Headers.Authorization.ToString();
    var presented = header.StartsWith("Bearer ", StringComparison.Ordinal) ? header[7..] : "";
    var ok = CryptographicOperations.FixedTimeEquals(
        SHA256.HashData(Encoding.UTF8.GetBytes(presented)),
        SHA256.HashData(Encoding.UTF8.GetBytes(settings.ApiToken)));
    return ok ? await next(context) : Results.Unauthorized();
});

// Loads on a job. `load` narrows to one load / truck number.
api.MapGet("/jobs/{job}/loads", (string job, string? load, PowerFabClient pf, CancellationToken ct) =>
    Run(pf, "GetLoads", new JsonObject
    {
        ["JobNumber"] = job,
        ["LoadNumber"] = load,
        ["IncludeLoads"] = true,
        ["IncludeUnshippedLoads"] = true,
        ["IncludeCompletedMaterial"] = true,
        ["IncludeRemainingMaterial"] = true,
    }, ct));

api.MapPost("/jobs/{job}/trucks/{truck}/pieces", (string job, string truck, PieceRequest piece, PowerFabClient pf, CancellationToken ct) =>
    LoadPiece(pf, job, truck, piece, "Save", ct));

api.MapDelete("/jobs/{job}/trucks/{truck}/pieces", (string job, string truck, [FromBody] PieceRequest piece, PowerFabClient pf, CancellationToken ct) =>
    LoadPiece(pf, job, truck, piece, "Delete", ct));

api.MapPost("/jobs/{job}/trucks/{truck}/ship", (string job, string truck, ShipRequest? ship, PowerFabClient pf, CancellationToken ct) =>
    settings.AllowWrites
        ? Run(pf, "Ship", new JsonObject { ["CommitType"] = "Save", ["JobNumber"] = job, ["TruckNumber"] = truck, ["Date"] = ship?.Date }, ct)
        : Task.FromResult(WritesDisabled()));

// Every PowerFab command gets its own route, generated from PowerFabCommands. Reads answer GET (query
// string as the command's fields) and POST (JSON body); writes answer POST only and need POWERFAB_ALLOW_WRITES.
// GET /api/commands lists them all so the web app can discover what is there.
api.MapGet("/commands", () => PowerFabCommands.All.Select(c => new
{
    name = c.Name,
    access = c.IsWrite ? "write" : "read",
    path = $"/api/commands/{c.Name}",
    methods = c.IsWrite ? new[] { "POST" } : ["GET", "POST"],
    enabled = !c.IsWrite || settings.AllowWrites,
}));

foreach (var command in PowerFabCommands.All)
{
    api.MapPost($"/commands/{command.Name}", (JsonObject? fields, PowerFabClient pf, CancellationToken ct) =>
        RunCommand(pf, command, fields, ct));
    if (!command.IsWrite)
        api.MapGet($"/commands/{command.Name}", (HttpRequest request, PowerFabClient pf, CancellationToken ct) =>
            RunCommand(pf, command, QueryFields(request.Query), ct));
}

// Pass-through for any command by name, e.g. POST /api/powerfab/GetProductionControlJobs with the fields as JSON.
// Known commands use their table entry; an unknown name may change data unless it starts with "Get".
api.MapPost("/powerfab/{command}", (string command, JsonObject? fields, PowerFabClient pf, CancellationToken ct) =>
{
    if (PowerFabCommands.SessionCommands.Contains(command))
        return Task.FromResult(Results.Problem("The service manages the PowerFab session itself.", statusCode: 400));
    var known = PowerFabCommands.Find(command)
        ?? new PowerFabCommand(command, command.StartsWith("Get", StringComparison.Ordinal) ? CommandAccess.Read : CommandAccess.Write);
    return RunCommand(pf, known, fields, ct);
});

app.Run();

Task<IResult> RunCommand(PowerFabClient pf, PowerFabCommand command, JsonObject? fields, CancellationToken ct) =>
    command.IsWrite && !settings.AllowWrites ? Task.FromResult(WritesDisabled()) : Run(pf, command.Name, fields, ct);

Task<IResult> LoadPiece(PowerFabClient pf, string job, string truck, PieceRequest piece, string commitType, CancellationToken ct)
{
    if (!settings.AllowWrites)
        return Task.FromResult(WritesDisabled());
    if (string.IsNullOrWhiteSpace(piece.MainMark) || piece.Quantity < 1)
        return Task.FromResult(Results.Problem("mainMark is required and quantity must be at least 1.", statusCode: 400));

    return Run(pf, "Load", new JsonObject
    {
        ["CommitType"] = commitType,
        ["JobNumber"] = job,
        ["TruckNumber"] = truck,
        ["MainMark"] = piece.MainMark.Trim(),
        ["Sequence"] = piece.Sequence,
        ["Quantity"] = piece.Quantity,
    }, ct);
}

static async Task<IResult> Run(PowerFabClient pf, string command, JsonObject? fields, CancellationToken ct)
{
    // Unset optional fields are left out of the XML rather than sent empty.
    foreach (var key in fields?.Where(f => f.Value is null).Select(f => f.Key).ToList() ?? [])
        fields!.Remove(key);

    XElement request;
    try
    {
        request = XmlJson.ToXml(command, fields);
    }
    catch (ArgumentException ex)
    {
        return Results.Problem(ex.Message, statusCode: 400);
    }

    try
    {
        return Results.Json(XmlJson.ToJson(await pf.ExecuteAsync(request, ct)));
    }
    catch (PowerFabException ex)
    {
        return Results.Problem(ex.Message, statusCode: ex.CommandRejected ? 422 : 502);
    }
}

// ?JobNumber=25-351&Sequence=1&Sequence=2 becomes { "JobNumber": "25-351", "Sequence": ["1", "2"] }.
static JsonObject QueryFields(IQueryCollection query)
{
    var fields = new JsonObject();
    foreach (var (key, values) in query)
        fields[key] = values.Count == 1 ? values[0] : new JsonArray(values.Select(v => (JsonNode?)v).ToArray());
    return fields;
}

static IResult WritesDisabled() =>
    Results.Problem("Writing to PowerFab is turned off (POWERFAB_ALLOW_WRITES).", statusCode: 403);

record PieceRequest(string MainMark, int Quantity = 1, string? Sequence = null);
record ShipRequest(string? Date);

public partial class Program;
