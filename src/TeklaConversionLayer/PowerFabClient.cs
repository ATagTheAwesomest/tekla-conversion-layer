using System.Xml.Linq;

namespace TeklaConversionLayer;

/// <summary>PowerFab answered, but the request or command failed.</summary>
public sealed class PowerFabException(string message, bool commandRejected) : Exception(message)
{
    /// <summary>True when PowerFab understood the command and refused it (bad mark, over quantity...).</summary>
    public bool CommandRejected { get; } = commandRejected;
}

/// <summary>
/// Sends FabSuiteXMLRequest documents to PowerFab and owns the remote session (ConnectRemote / ConnectionGUID).
/// The transport is Tekla's ExecuteRemote in production, or <see cref="MockPowerFab"/> for development.
/// Calls are serialized: one PowerFab session, one command at a time.
/// </summary>
public sealed class PowerFabClient(Func<string, string> transport, string username, string password)
{
    public static readonly XNamespace RequestNs = "http://www.fabsuite.com/xml/fabsuite-xml-request-v0108.xsd";

    readonly SemaphoreSlim gate = new(1, 1);
    string? connectionGuid;

    public async Task<XElement> ExecuteAsync(XElement command, CancellationToken ct = default)
    {
        // CommandGUID lets PowerFab drop a duplicate if we resend after a dropped connection.
        command.SetElementValue(RequestNs + "CommandGUID", Guid.NewGuid().ToString().ToUpperInvariant());
        await gate.WaitAsync(ct);
        try
        {
            return await Task.Run(() => ExecuteLocked(command), ct);
        }
        finally
        {
            gate.Release();
        }
    }

    XElement ExecuteLocked(XElement command)
    {
        for (var attempt = 0; ; attempt++)
        {
            connectionGuid ??= Connect();
            var response = Send(command, connectionGuid);
            var xmlError = response.Elements().FirstOrDefault(e => e.Name.LocalName == "XMLError");
            if (xmlError is null)
                return CommandResult(response, command.Name.LocalName);

            // An expired session also shows up as XMLError: reconnect once, then give up.
            connectionGuid = null;
            if (attempt > 0)
                throw new PowerFabException($"PowerFab rejected the request: {xmlError.Value}", commandRejected: false);
        }
    }

    string Connect()
    {
        var connect = new XElement(RequestNs + "ConnectRemote",
            new XElement(RequestNs + "Username", username),
            new XElement(RequestNs + "Password", password));
        var response = Send(connect, guid: null);
        var xmlError = response.Elements().FirstOrDefault(e => e.Name.LocalName == "XMLError");
        if (xmlError is not null)
            throw new PowerFabException($"PowerFab login failed: {xmlError.Value}", commandRejected: false);

        var result = CommandResult(response, "ConnectRemote");
        return Child(result, "ConnectionGUID")
            ?? throw new PowerFabException("PowerFab login returned no ConnectionGUID.", commandRejected: false);
    }

    XElement Send(XElement command, string? guid)
    {
        var request = new XElement(RequestNs + "FabSuiteXMLRequest");
        if (guid is not null) request.Add(new XElement(RequestNs + "ConnectionGUID", guid));
        request.Add(command);

        string raw;
        try
        {
            raw = transport(request.ToString(SaveOptions.DisableFormatting));
        }
        catch (Exception ex)
        {
            connectionGuid = null;
            throw new PowerFabException($"Could not reach PowerFab: {ex.Message}", commandRejected: false);
        }

        try
        {
            return XElement.Parse(raw);
        }
        catch (System.Xml.XmlException)
        {
            throw new PowerFabException("PowerFab returned a response that is not XML.", commandRejected: false);
        }
    }

    static XElement CommandResult(XElement response, string commandName)
    {
        var result = response.Elements().FirstOrDefault(e => e.Name.LocalName == commandName)
            ?? throw new PowerFabException($"PowerFab response has no {commandName} element.", commandRejected: false);

        if (Child(result, "Successful") is "0" or "false")
            throw new PowerFabException(Child(result, "ErrorMessage") ?? $"PowerFab refused {commandName}.", commandRejected: true);
        return result;
    }

    static string? Child(XElement element, string name) =>
        element.Elements().FirstOrDefault(e => e.Name.LocalName == name)?.Value;
}
