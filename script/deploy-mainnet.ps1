$ErrorActionPreference = "Stop"

$rpc = if ($env:ZG_RPC_URL) { $env:ZG_RPC_URL.Trim() } else { "https://evmrpc.0g.ai" }
$key = $env:BREACH_ARENA_DEPLOYER_PRIVATE_KEY
if ([string]::IsNullOrWhiteSpace($key)) {
    throw "Load BREACH_ARENA_DEPLOYER_PRIVATE_KEY from a dedicated funded service wallet."
}

$forge = (Get-Command forge -ErrorAction Stop).Source
$payload = @{
    jsonrpc = "2.0"
    method = "eth_chainId"
    params = @()
    id = 1
} | ConvertTo-Json -Compress
$response = Invoke-RestMethod -Uri $rpc -Method Post -ContentType "application/json" -Body $payload
$chainId = [Convert]::ToInt64($response.result, 16)
if ($chainId -ne 16661) {
    throw "Refusing deployment on chain $chainId; expected 0G Mainnet 16661."
}

& $forge create contracts/BreachArena.sol:BreachArena `
    --rpc-url $rpc `
    --private-key $key.Trim() `
    --broadcast

if ($LASTEXITCODE -ne 0) {
    throw "BreachArena deployment failed."
}
