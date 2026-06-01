<#
.SYNOPSIS
    Project Core — остановка всех процессов
.DESCRIPTION
    Останавливает frontend, backend и опционально MongoDB контейнер
#>

param(
    [switch]$StopDocker
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Останавливаю Project Core..." -ForegroundColor Cyan

# Останавливаем frontend (ng)
$ngProcess = Get-Process -Name "ng" -ErrorAction SilentlyContinue
if ($ngProcess) {
    $ngProcess | Stop-Process -Force
    Write-Host "  ✔ Frontend остановлен" -ForegroundColor Green
}

# Останавливаем backend (tsx)
$tsxProcess = Get-Process -Name "tsx" -ErrorAction SilentlyContinue
if ($tsxProcess) {
    $tsxProcess | Stop-Process -Force
    Write-Host "  ✔ Backend остановлен" -ForegroundColor Green
}

# Останавливаем node (на случай если tsx не поймали)
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "project-core" }
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
}

if ($StopDocker) {
    docker stop project-core-mongodb 2>$null
    docker rm project-core-mongodb 2>$null
    Write-Host "  ✔ MongoDB контейнер остановлен" -ForegroundColor Green
}

Write-Host "`nПроект остановлен." -ForegroundColor Green
