$ErrorActionPreference = "Stop"

$rpc = if ($env:ZG_RPC_URL) { $env:ZG_RPC_URL.Trim() } else { "https://evmrpc.0g.ai" }
$payload = @{
    jsonrpc = "2.0"
    method = "eth_chainId"
    params = @()
    id = 1
} | ConvertTo-Json -Compress

Write-Host "ZERO//BREACH 0G Mainnet doctor"
$response = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $payload
$chainId = [Convert]::ToInt64($response.result, 16)
if ($chainId -ne 16661) {
    throw "RPC chain ID is $chainId; expected 16661."
}
Write-Host "[ok] RPC is 0G Mainnet (16661)"

$required = @("ZG_COMPUTE_API_KEY", "VAULT_SECRET_SEED")
foreach ($name in $required) {
    $value = [Environment]::GetEnvironmentVariable($name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "[missing] $name"
    } else {
        Write-Host "[ok] $name is loaded"
    }
}

foreach ($name in @("ZG_STORAGE_PRIVATE_KEY", "BREACH_ARENA_OPERATOR_PRIVATE_KEY")) {
    $value = [Environment]::GetEnvironmentVariable($name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "[optional] $name is not loaded"
    } elseif ($value.Trim().Length -ne 66) {
        Write-Host "[invalid] $name must be a 0x-prefixed 32-byte key"
    } else {
        Write-Host "[ok] $name has the expected length"
    }
}

if ($env:BREACH_ARENA_CONTRACT_ADDRESS) {
    Write-Host "[info] Arena contract: $($env:BREACH_ARENA_CONTRACT_ADDRESS.Trim())"
} else {
    Write-Host "[optional] BREACH_ARENA_CONTRACT_ADDRESS is not set"
}
