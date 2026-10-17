[CmdletBinding()]
param(
  [switch]$Start
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$MinimumNodeMajor = 22

function Refresh-ProcessPath {
  $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = @($env:Path, $machinePath, $userPath) -join ';'
}

function Get-Executable {
  param([Parameter(Mandatory)][string]$Name)

  return Get-Command $Name -ErrorAction SilentlyContinue
}

function Install-WingetPackage {
  param(
    [Parameter(Mandatory)][string]$Id,
    [Parameter(Mandatory)][string]$Label
  )

  if (-not (Get-Executable 'winget')) {
    throw "Winget is required to install $Label automatically. Install Microsoft App Installer, then run this script again."
  }

  Write-Host "Installing $Label..."
  & winget install --id $Id --exact --source winget --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to install $Label with winget."
  }
  Refresh-ProcessPath
}

function Require-Executable {
  param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][string]$PackageId,
    [Parameter(Mandatory)][string]$Label
  )

  if (-not (Get-Executable $Name)) {
    Install-WingetPackage -Id $PackageId -Label $Label
  }
  if (-not (Get-Executable $Name)) {
    throw "$Label was installed, but $Name is not available in this PowerShell session. Open a new PowerShell window and run this script again."
  }
}

if ($env:OS -ne 'Windows_NT') {
  throw 'This installer is for Windows PowerShell. Use the README setup commands in WSL or macOS/Linux.'
}

Require-Executable -Name 'node' -PackageId 'OpenJS.NodeJS.LTS' -Label 'Node.js LTS'
Require-Executable -Name 'npm' -PackageId 'OpenJS.NodeJS.LTS' -Label 'npm'

$nodeVersion = (& node --version).Trim()
$nodeMajor = [int]($nodeVersion.TrimStart('v').Split('.')[0])
if ($nodeMajor -lt $MinimumNodeMajor) {
  throw "Node.js $MinimumNodeMajor or later is required. Found $nodeVersion. Update Node.js LTS, then run this script again."
}

$projectPath = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$packageJsonPath = Join-Path $projectPath 'package.json'
$packageLockPath = Join-Path $projectPath 'package-lock.json'
if (-not (Test-Path -LiteralPath $packageJsonPath) -or -not (Test-Path -LiteralPath $packageLockPath)) {
  throw 'Run install.ps1 from the root of a cloned SecTrack repository.'
}

Push-Location $projectPath
try {
  Write-Host 'Installing the locked project dependencies...'
  & npm ci
  if ($LASTEXITCODE -ne 0) {
    throw 'npm ci failed.'
  }
} finally {
  Pop-Location
}

Write-Host ''
Write-Host 'SecTrack is ready.'
Write-Host "Folder: $projectPath"
Write-Host 'Start it later with:'
Write-Host "  Set-Location '$projectPath'"
Write-Host '  npm run dev'
Write-Host 'Then open http://localhost:5173'

if ($Start) {
  Set-Location $projectPath
  & npm run dev
}
