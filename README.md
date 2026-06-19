# ZERO//BREACH

The verifiable multiplayer AI red-team arena powered by 0G.

Players connect a wallet, select an autonomous vault, submit an adversarial prompt, and receive a verdict from an independent AI referee. Authentic battle replays can be anchored to 0G Storage and finalized on 0G Mainnet.

## Product principles

- Synthetic secrets only.
- No simulated battle results.
- Wallet-bound attack authorization.
- 0G Compute for both the vault and referee.
- 0G Storage for reproducible battle replays.
- 0G Mainnet for permanent scores.
- Dedicated service wallets only; never use a personal treasury wallet.

## Local development

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The interface runs at `http://localhost:5174`.

Without `ZG_COMPUTE_API_KEY`, the UI remains available but attacks fail closed with a clear service message.

Set `VAULT_SECRET_SEED` to at least 32 random characters. Vault flags are derived
server-side with HMAC and never stored as literals in source control.

## Production Compute setup

From the project directory:

```powershell
.\script\configure-compute.ps1
```

The Vercel CLI prompts for the Compute key directly. Do not paste API keys or
private keys into chat, source files, or PowerShell pipelines.

## Storage and Mainnet settlement

After deploying `BreachArena`, load the dedicated service-wallet key into
`ZG_STORAGE_PRIVATE_KEY` and `BREACH_ARENA_OPERATOR_PRIVATE_KEY`, then run:

```powershell
.\script\configure-services.ps1
```

The helper validates that the key resolves to the deployed contract owner and
streams secrets to Vercel without displaying them or adding line endings.
