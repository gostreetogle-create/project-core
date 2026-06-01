<#
.SYNOPSIS
    Project Core - universal launcher
.DESCRIPTION
    One command to start everything:
    1. Check Node.js and npm
    2. Install dependencies if missing
    3. Check Docker and start MongoDB container
    4. Free ports 3000 and 4200
    5. Start backend (Express on port 3000)
    6. Start frontend (Angular on port 4200)
    7. Open browser
.NOTES
    Windows 10/11, PowerShell 5.1+
#>

param(
    [switch]$NoBrowser,
    [switch]$NoDocker
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSCommandPath

# ---- Color output helpers ----
function Write-Step { param([string]$Msg) Write-Host "`n[STEP] $Msg" -ForegroundColor Cyan }
function Write-OK   { param([string]$Msg) Write-Host "  OK $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "  !! $Msg" -ForegroundColor Yellow }
function Write-Err  { param([string]$Msg) Write-Host "  XX $Msg" -ForegroundColor Red }

Write-Host "Project Core - Starting..." -ForegroundColor Cyan

# ---- 1. Check Node.js ----
Write-Step "Checking Node.js..."
try {
    $nv = node -v
    Write-OK "Node.js $nv"
} catch {
    Write-Err "Node.js not found. Install Node.js 22+ from https://nodejs.org"
    exit 1
}

# ---- 2. Install dependencies ----
Write-Step "Installing frontend dependencies..."
Push-Location $ProjectRoot
if (-not (Test-Path "node_modules")) {
    npm install --loglevel error
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Err "npm install failed"; exit 1 }
    Write-OK "Frontend dependencies installed"
} else {
    Write-OK "Frontend dependencies exist"
}
Pop-Location

Write-Step "Installing backend dependencies..."
Push-Location (Join-Path $ProjectRoot "backend")
if (-not (Test-Path "node_modules")) {
    npm install --loglevel error
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Err "npm install failed"; exit 1 }
    Write-OK "Backend dependencies installed"
} else {
    Write-OK "Backend dependencies exist"
}
Pop-Location

# ---- 3. Check Docker ----
if (-not $NoDocker) {
    Write-Step "Checking Docker..."
    
    # Check if Docker daemon is actually running
    try {
        $dv = docker version --format "{{.Server.Version}}" 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $dv) { throw "Docker daemon not running" }
        Write-OK "Docker $dv"
    } catch {
        Write-Warn "Docker daemon not available. Skipping MongoDB."
        Write-Warn "Start Docker Desktop manually if you need MongoDB."
        $NoDocker = $true
    }

    if (-not $NoDocker) {
        # Step 1: check port 27017 status
        $portInUse = netstat -ano | findstr ":27017 "
        
        # Step 2: find any container using port 27017
        $containerOnPort = docker ps --filter "publish=27017" --format "{{.Names}}" 2>&1
        $ourContainerRunning = docker ps --filter "name=project-core-mongodb" --filter "status=running" --format "{{.Names}}" 2>&1
        $ourContainerExists = docker ps -a --filter "name=project-core-mongodb" --format "{{.Names}}" 2>&1
        
        if ($ourContainerRunning -match "project-core-mongodb") {
            Write-OK "MongoDB container already running"
            
        } elseif ($containerOnPort) {
            # Another MongoDB (e.g. kppdf-mongodb) already uses port 27017
            Write-Warn "Port 27017 already in use by container: $containerOnPort"
            Write-OK "Using existing MongoDB on port 27017"
            
        } elseif ($portInUse) {
            Write-Warn "Port 27017 is in use by a non-Docker process."
            Write-Warn "Skipping MongoDB container."
            
        } else {
            if ($ourContainerExists) {
                Write-Warn "Removing old MongoDB container..."
                docker rm -f project-core-mongodb 2>&1 | Out-Null
            }
            
            Write-Warn "Starting MongoDB container..."
            $result = docker run -d --name project-core-mongodb --restart unless-stopped -p 27017:27017 -v project-core-mongodb-data:/data/db mongo:7 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-OK "MongoDB container started"
                Start-Sleep -Seconds 3
            } else {
                Write-Warn "$result"
                Write-Warn "Project will work without MongoDB for frontend development."
            }
        }
    }
} else {
    Write-Warn "Docker skipped (use -NoDocker flag)"
}

# Always continue even if MongoDB failed
Write-OK "Continuing startup..."

# ---- 4. Free ports ----
Write-Step "Checking ports..."
function Free-Port($Port) {
    $conn = netstat -ano | findstr ":$Port "
    if ($conn) {
        # Парсим PID — он последняя колонка в строке netstat
        foreach ($line in $conn) {
            $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
            $procId = $parts[-1]
            if ($procId -and $procId -match '^\d+$' -and $procId -ne '0') {
                try {
                    Stop-Process -Id $procId -Force -ErrorAction Stop
                    Write-Warn "Port ${Port}: process ${procId} killed"
                } catch {
                    Write-Warn "Port ${Port}: in use by process ${procId} (could not kill)"
                }
            }
        }
        Start-Sleep -Seconds 1
    } else {
        Write-OK "Port $Port is free"
    }
}
Free-Port 3000
Free-Port 4200

# ---- 5. Start backend ----
Write-Step "Starting backend..."
$backendDir = Join-Path $ProjectRoot "backend"
Get-Process -Name "tsx" -ErrorAction SilentlyContinue | Stop-Process -Force
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== BACKEND ===' -ForegroundColor Cyan; cd `"$backendDir`"; npx tsx watch src/index.ts" -PassThru
Start-Sleep -Seconds 4
Write-OK "Backend starting on http://localhost:3000"

# ---- 6. Start frontend ----
Write-Step "Starting frontend..."
Get-Process -Name "ng" -ErrorAction SilentlyContinue | Stop-Process -Force
$env:NG_CLI_ANALYTICS = "false"
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== FRONTEND (Angular) ===' -ForegroundColor Cyan; Write-Host 'Compiling...' -ForegroundColor Yellow; cd `"$ProjectRoot`"; npx ng serve --port 4200" -PassThru

# ---- 7. Wait for Angular compilation, then open browser ----
Write-Host "`nWaiting for Angular compilation (30-60 sec)..." -ForegroundColor Yellow
Start-Sleep -Seconds 45
if (-not $NoBrowser) {
    Write-Step "Opening browser..."
    Start-Process "http://localhost:4200"
}

# ---- 8. Summary ----
Write-Host ""
Write-Host "Project Core started!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API:      http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: close PowerShell windows or run stop.ps1" -ForegroundColor Gray
