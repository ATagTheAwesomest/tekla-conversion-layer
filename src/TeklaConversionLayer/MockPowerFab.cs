using System.Xml.Linq;

namespace TeklaConversionLayer;

/// <summary>
/// In-memory stand-in for the PowerFab Remote Server, so the service runs and tests without PowerFab.
/// It speaks the same FabSuiteXMLRequest envelope but only implements ConnectRemote, CloseRemote,
/// GetLoads, Load and Ship. Its GetLoads response layout is our guess, not PowerFab's.
/// </summary>
public sealed class MockPowerFab
{
    sealed record Truck(List<Piece> Pieces)
    {
        public string? ShippedOn { get; set; }
    }

    sealed record Piece(string MainMark, string Sequence)
    {
        public int Quantity { get; set; }
    }

    readonly Lock sync = new();
    readonly HashSet<string> sessions = [];
    readonly Dictionary<(string Job, string Truck), Truck> trucks = [];

    public string Execute(string requestXml)
    {
        lock (sync)
        {
            var request = XElement.Parse(requestXml);
            var command = request.Elements().Last();
            var guid = Field(request, "ConnectionGUID");

            if (command.Name.LocalName == "ConnectRemote")
            {
                var newGuid = Guid.NewGuid().ToString().ToUpperInvariant();
                sessions.Add(newGuid);
                return Response(Ok("ConnectRemote", new XElement("ConnectionGUID", newGuid)));
            }
            if (guid is null || !sessions.Contains(guid))
                return Response(new XElement("XMLError", "Invalid or expired ConnectionGUID."));

            return Response(command.Name.LocalName switch
            {
                "CloseRemote" => CloseRemote(guid),
                "GetLoads" => GetLoads(command),
                "Load" => Load(command),
                "Ship" => Ship(command),
                var other => Fail(other, $"The mock does not implement {other}."),
            });
        }
    }

    /// <summary>Test hook: forget all sessions, as if the Remote Server restarted.</summary>
    public void ExpireSessions()
    {
        lock (sync) sessions.Clear();
    }

    XElement CloseRemote(string guid)
    {
        sessions.Remove(guid);
        return Ok("CloseRemote");
    }

    XElement GetLoads(XElement cmd)
    {
        var job = Field(cmd, "JobNumber");
        var loadNumber = Field(cmd, "LoadNumber");
        var result = Ok("GetLoads");
        foreach (var ((j, truckNumber), truck) in trucks.OrderBy(t => t.Key.Truck, StringComparer.Ordinal))
        {
            if (j != job || (loadNumber is not null && loadNumber != truckNumber)) continue;
            result.Add(new XElement("Load",
                new XElement("TruckNumber", truckNumber),
                new XElement("Shipped", truck.ShippedOn is null ? "false" : "true"),
                truck.ShippedOn is null ? null : new XElement("ShipDate", truck.ShippedOn),
                truck.Pieces.Select(p => new XElement("Material",
                    new XElement("MainMark", p.MainMark),
                    new XElement("Sequence", p.Sequence),
                    new XElement("Quantity", p.Quantity)))));
        }
        return result;
    }

    XElement Load(XElement cmd)
    {
        var job = Field(cmd, "JobNumber");
        var truckNumber = Field(cmd, "TruckNumber");
        var mark = Field(cmd, "MainMark");
        var sequence = Field(cmd, "Sequence") ?? "";
        if (job is null || truckNumber is null || mark is null)
            return Fail("Load", "JobNumber, TruckNumber and MainMark are required.");
        if (!int.TryParse(Field(cmd, "Quantity") ?? "1", out var quantity) || quantity < 1)
            return Fail("Load", "Quantity must be a positive whole number.");

        var deleting = Field(cmd, "CommitType") == "Delete";
        if (!trucks.TryGetValue((job, truckNumber), out var truck))
        {
            if (deleting) return Fail("Load", $"Truck {truckNumber} has no pieces.");
            trucks[(job, truckNumber)] = truck = new Truck([]);
        }
        if (truck.ShippedOn is not null)
            return Fail("Load", $"Truck {truckNumber} has already shipped.");

        var piece = truck.Pieces.FirstOrDefault(p => p.MainMark == mark && p.Sequence == sequence);
        if (deleting)
        {
            if (piece is null || piece.Quantity < quantity)
                return Fail("Load", $"Truck {truckNumber} does not have {quantity} of {mark}.");
            piece.Quantity -= quantity;
            if (piece.Quantity == 0) truck.Pieces.Remove(piece);
        }
        else
        {
            if (piece is null) truck.Pieces.Add(piece = new Piece(mark, sequence));
            piece.Quantity += quantity;
        }
        return Ok("Load");
    }

    XElement Ship(XElement cmd)
    {
        var job = Field(cmd, "JobNumber");
        var truckNumber = Field(cmd, "TruckNumber");
        if (job is null || truckNumber is null || !trucks.TryGetValue((job, truckNumber), out var truck))
            return Fail("Ship", $"Truck {truckNumber} not found on job {job}.");
        if (truck.ShippedOn is not null)
            return Fail("Ship", $"Truck {truckNumber} has already shipped.");
        truck.ShippedOn = Field(cmd, "Date") ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
        return Ok("Ship");
    }

    static string? Field(XElement element, string name) =>
        element.Elements().FirstOrDefault(e => e.Name.LocalName == name)?.Value;

    static XElement Ok(string command, params object[] content) =>
        new(command, new XElement("Successful", "1"), content);

    static XElement Fail(string command, string message) =>
        new(command, new XElement("Successful", "0"), new XElement("ErrorMessage", message));

    static string Response(XElement content) =>
        new XElement("FabSuiteXMLResponse", content).ToString(SaveOptions.DisableFormatting);
}
