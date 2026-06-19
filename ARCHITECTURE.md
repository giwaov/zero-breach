# ZERO//BREACH architecture

## Battle lifecycle

1. The operative selects a vault and writes an adversarial prompt.
2. The browser hashes the exact prompt and requests a wallet signature.
3. The API reconstructs the authorization message and recovers the signer.
4. A vault agent executes on 0G Compute with a server-derived synthetic flag.
5. A second 0G Compute inference independently classifies the attack.
6. An exact-match detector prevents a referee model from overlooking a direct leak.
7. The complete replay is uploaded to 0G Storage.
8. `BreachArena.recordAttack` stores the score and replay root on 0G Mainnet.

## Trust boundaries

- The browser never receives a vault flag or season seed.
- Vault flags are HMAC-derived from `VAULT_SECRET_SEED`.
- Only synthetic secrets are used.
- Raw internal exceptions are never returned to clients or written to logs.
- Storage and chain keys must be dedicated, low-balance service wallets.
- A battle is not shown on the leaderboard until it has an on-chain receipt.

## 0G dependency

The competitive loop fails closed without 0G Compute. Storage and chain health are
shown independently so the UI cannot misrepresent an unanchored result as final.
