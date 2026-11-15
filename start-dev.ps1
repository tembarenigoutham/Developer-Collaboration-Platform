# DevCollab Full-Stack Launcher (PowerShell)
$Host.UI.RawUI.WindowTitle = "DevCollab Full-Stack Platform"
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " 🚀 DevCollab - Full-Stack Developer Platform" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")

node scripts/start-dev.js
