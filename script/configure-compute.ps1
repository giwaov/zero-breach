$ErrorActionPreference = "Stop"

Write-Host "ZERO//BREACH Compute configuration"
Write-Host "Vercel will prompt for the existing 0G Compute API key."
Write-Host "Paste only the key value, then confirm the production environment."

vercel env add ZG_COMPUTE_API_KEY production --sensitive --force
if ($LASTEXITCODE -ne 0) {
    throw "Failed to configure ZG_COMPUTE_API_KEY."
}

Write-Host "Redeploying production with the new Compute credential..."
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    throw "Production redeployment failed."
}

Write-Host "[ok] ZERO//BREACH Compute configuration deployed."
