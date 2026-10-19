# Builds a self-contained Windows package (no .NET install needed on the server) into dist/.
# Run from the repo root on a machine with the .NET 10 SDK.
$ErrorActionPreference = 'Stop'
$out = 'dist/TeklaConversionLayer'
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
dotnet publish src/TeklaConversionLayer -c Release -r win-x64 --self-contained -p:PublishSingleFile=true -o $out
Copy-Item windows/install-service.ps1, windows/local.settings.example.json $out
Compress-Archive -Path "$out/*" -DestinationPath dist/TeklaConversionLayer-win-x64.zip
Write-Host "Built dist/TeklaConversionLayer-win-x64.zip"
