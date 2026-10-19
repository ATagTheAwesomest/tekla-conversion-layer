#Requires -RunAsAdministrator
# Installs (or updates) the Windows service from the folder this script sits in.
# Usage: copy local.settings.example.json to local.settings.json, fill it in, then run this script.
$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
$exe = Join-Path $dir 'TeklaConversionLayer.exe'
$name = 'TeklaConversionLayer'

if (-not (Test-Path $exe)) { throw "TeklaConversionLayer.exe not found next to this script." }
if (-not (Test-Path (Join-Path $dir 'local.settings.json'))) {
    throw "Create local.settings.json first (copy local.settings.example.json and fill in API_TOKEN)."
}

if (Get-Service $name -ErrorAction SilentlyContinue) {
    Stop-Service $name -ErrorAction SilentlyContinue
    sc.exe delete $name | Out-Null
    Start-Sleep 2
}
New-Service -Name $name -BinaryPathName "`"$exe`"" -DisplayName 'Tekla Conversion Layer' `
    -Description 'JSON API bridge between terra-loads-web and Tekla PowerFab' -StartupType Automatic | Out-Null
# Restart automatically after a crash.
sc.exe failure $name reset= 86400 actions= restart/5000/restart/5000/restart/30000 | Out-Null
Start-Service $name
Write-Host "Service started. Check: Invoke-RestMethod http://127.0.0.1:8090/health"
