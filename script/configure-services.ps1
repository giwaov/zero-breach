$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$contractAddress = "0x4B515626bd9e17c1a53f11C0a162DAd2E73a0350"
$expectedOperator = "0x662Ef31e2407Da16CE5b969C69807C313a1E5B13"
$storageKey = $env:ZG_STORAGE_PRIVATE_KEY
$operatorKey = $env:BREACH_ARENA_OPERATOR_PRIVATE_KEY

foreach ($entry in @{
    ZG_STORAGE_PRIVATE_KEY = $storageKey
    BREACH_ARENA_OPERATOR_PRIVATE_KEY = $operatorKey
}.GetEnumerator()) {
    if ([string]::IsNullOrWhiteSpace($entry.Value)) {
        throw "$($entry.Key) is not loaded in this PowerShell session."
    }
    if ($entry.Value.Trim().Length -ne 66 -or -not $entry.Value.Trim().StartsWith("0x")) {
        throw "$($entry.Key) must be a 0x-prefixed 32-byte private key."
    }
}

$castCandidates = @(
    "$env:USERPROFILE\.foundry\bin\cast.exe",
    "$env:USERPROFILE\.cargo\bin\cast.exe"
)
$cast = $castCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $cast) {
    throw "cast.exe was not found in the Foundry or Cargo directories."
}

$operatorAddress = (& $cast wallet address --private-key $operatorKey.Trim()).Trim()
if ($operatorAddress -ine $expectedOperator) {
    throw "The operator key resolves to $operatorAddress, expected $expectedOperator."
}

function Set-VercelSecretWithoutNewline {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/d /s /c vercel env add $Name production --sensitive --force --yes"
    $startInfo.WorkingDirectory = $projectRoot
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardInput = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    [void]$process.Start()
    $process.StandardInput.Write($Value.Trim())
    $process.StandardInput.Close()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    if ($process.ExitCode -ne 0) {
        throw "Failed to configure $Name in Vercel. $stderr"
    }
    Write-Host "[ok] $Name configured"
}

Write-Host "Configuring ZERO//BREACH production services..."
Set-VercelSecretWithoutNewline "ZG_STORAGE_PRIVATE_KEY" $storageKey
Set-VercelSecretWithoutNewline "BREACH_ARENA_OPERATOR_PRIVATE_KEY" $operatorKey

vercel --cwd $projectRoot env add BREACH_ARENA_CONTRACT_ADDRESS production `
    --value $contractAddress `
    --force `
    --yes
if ($LASTEXITCODE -ne 0) {
    throw "Failed to configure BREACH_ARENA_CONTRACT_ADDRESS."
}

Write-Host "Redeploying production..."
vercel --cwd $projectRoot --prod --yes
if ($LASTEXITCODE -ne 0) {
    throw "ZERO//BREACH production redeployment failed."
}

Write-Host "[ok] Storage and 0G Mainnet settlement configured."
