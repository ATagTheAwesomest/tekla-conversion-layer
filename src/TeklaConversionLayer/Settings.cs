namespace TeklaConversionLayer;

/// <summary>Runtime settings, read from environment variables (see .env.example).</summary>
public sealed record Settings(
    string ApiToken,
    bool MockMode,
    string Host,
    int Port,
    string Username,
    string Password,
    bool AllowWrites,
    string[] CorsOrigins,
    FileSettings Files)
{
    public static Settings From(IConfiguration config)
    {
        var token = config["API_TOKEN"] ?? "";
        if (token.Length < 32)
            throw new InvalidOperationException("API_TOKEN must be set to a random value of at least 32 characters.");

        var mode = (config["POWERFAB_MODE"] ?? "mock").Trim().ToLowerInvariant();
        if (mode is not ("mock" or "remote"))
            throw new InvalidOperationException("POWERFAB_MODE must be 'mock' or 'remote'.");

        var settings = new Settings(
            token,
            mode == "mock",
            config["POWERFAB_HOST"] ?? "",
            int.TryParse(config["POWERFAB_PORT"], out var port) ? port : 9154,
            config["POWERFAB_USERNAME"] ?? "",
            config["POWERFAB_PASSWORD"] ?? "",
            bool.TryParse(config["POWERFAB_ALLOW_WRITES"], out var writes) && writes,
            (config["CORS_ORIGINS"] ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
            FileSettings.From(config));

        if (!settings.MockMode && (settings.Host == "" || settings.Username == "" || settings.Password == ""))
            throw new InvalidOperationException("Remote mode needs POWERFAB_HOST, POWERFAB_USERNAME and POWERFAB_PASSWORD.");

        return settings;
    }
}
