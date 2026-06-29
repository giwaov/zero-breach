import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import {
  Activity,
  ArrowLeft,
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Binary,
  Blocks,
  Bolt,
  Bot,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  FileSearch,
  Fingerprint,
  Flame,
  Github,
  LockKeyhole,
  Menu,
  Radio,
  ScanLine,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Swords,
  Terminal,
  Trophy,
  X,
  Zap
} from "lucide-react";
import { useAccount, useSignMessage, useSwitchChain } from "wagmi";
import type {
  AttackPhase,
  AttackResult,
  BattleReplay,
  FinalizedBattle,
  LeaderboardEntry,
  Vault
} from "./types";
import { vaults } from "./vaults";

type Health = {
  ok: boolean;
  compute: "live" | "not-configured";
  vaults: "live" | "not-configured";
  storage: "live" | "not-configured";
  chain: "live" | "not-configured";
};

const phaseCopy: Record<AttackPhase, string> = {
  idle: "AWAITING ATTACK VECTOR",
  signing: "AUTHORIZING OPERATOR",
  vault: "VAULT AGENT RESPONDING",
  referee: "INDEPENDENT REFEREE INSPECTING",
  anchoring: "ANCHORING BATTLE REPLAY",
  complete: "BATTLE FINALIZED"
};

const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;

const shortHash = (value: string) =>
  `${value.slice(0, 12)}…${value.slice(-8)}`;

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "compact" : ""}`}>
      <span className="logo-zero">0</span>
      <span>ZERO</span>
      <i>//</i>
      <strong>BREACH</strong>
    </div>
  );
}

function WalletControl() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button className="nav-wallet" onClick={openConnectModal}>
              <Fingerprint size={14} />
              <span>CONNECT OPERATIVE</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button className="nav-wallet danger" onClick={openChainModal}>
              WRONG NETWORK
            </button>
          );
        }

        return (
          <button className="nav-wallet connected" onClick={openAccountModal}>
            <i />
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

function VaultCard({
  vault,
  selected,
  onSelect
}: {
  vault: Vault;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`vault-card ${selected ? "selected" : ""}`}
      style={{ "--vault": vault.color } as React.CSSProperties}
      onClick={onSelect}
    >
      <div className="vault-card-top">
        <div className="vault-monogram">
          <span>{vault.icon}</span>
          <ScanLine size={18} />
        </div>
        <div className={`difficulty ${vault.difficulty.toLowerCase()}`}>
          {vault.difficulty}
        </div>
      </div>
      <small>{vault.codename}</small>
      <h3>{vault.name}</h3>
      <p>{vault.description}</p>
      <div className="vault-metrics">
        <div>
          <span>DEFENSE</span>
          <strong>{vault.defense}</strong>
          <em>/100</em>
        </div>
        <div>
          <span>REWARD</span>
          <strong>{vault.bounty}</strong>
          <em>XP</em>
        </div>
      </div>
      <div className="defense-meter">
        <span style={{ width: `${vault.defense}%` }} />
      </div>
      <div className="select-vault">
        {selected ? (
          <>
            <Check size={14} /> TARGET LOCKED
          </>
        ) : (
          <>
            SELECT TARGET <ArrowRight size={14} />
          </>
        )}
      </div>
    </button>
  );
}

function ReplayPage({ rootHash }: { rootHash: string }) {
  const [replay, setReplay] = useState<BattleReplay | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    void fetch(`/api/replays/${encodeURIComponent(rootHash)}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          replay?: BattleReplay;
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error ?? "Replay unavailable.");
        return payload.replay;
      })
      .then((value) => {
        if (!active) return;
        setReplay(value ?? null);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Replay unavailable."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [rootHash]);

  return (
    <div className="site-shell replay-shell">
      <div className="grid-noise" />
      <div className="red-glow glow-one" />
      <nav className="nav">
        <a href="/" aria-label="ZERO BREACH home">
          <Logo />
        </a>
        <div className="nav-links">
          <a href="/#vaults">VAULTS</a>
          <a href="/#arena">ATTACK LAB</a>
          <a href="/#leaderboard">RANKINGS</a>
        </div>
        <div className="nav-right">
          <div className="network-status">
            <i className="online" />
            0G STORAGE REPLAY
          </div>
          <a className="nav-wallet connected" href="/">
            <ArrowLeft size={14} />
            ARENA
          </a>
        </div>
      </nav>

      <main className="replay-main">
        <section className="replay-hero">
          <div className="hero-kicker">
            <FileSearch size={13} />
            PUBLIC BATTLE REPLAY
          </div>
          <h1>
            Every attack has
            <br />
            <span>receipts.</span>
          </h1>
          <p>
            This page loads the battle artifact from 0G Storage using the replay
            root finalized by the ZERO//BREACH Mainnet contract.
          </p>
          <div className="replay-root">
            <span>0G STORAGE ROOT</span>
            <strong>{rootHash}</strong>
          </div>
        </section>

        {loading && (
          <section className="replay-card replay-loading">
            <span className="spinner" />
            Loading replay from 0G Storage…
          </section>
        )}

        {!loading && error && (
          <section className="replay-card replay-error">
            <ShieldAlert size={22} />
            <div>
              <strong>Replay could not be loaded</strong>
              <p>{error}</p>
            </div>
          </section>
        )}

        {!loading && replay && (
          <section className={`replay-card ${replay.verdict.breached ? "breached" : "defended"}`}>
            <div className="replay-verdict">
              <div>
                <span className="section-kicker">VERDICT</span>
                <h2>{replay.verdict.classification}</h2>
                <p>{replay.verdict.summary}</p>
              </div>
              <div className="result-score">
                <small>SCORE</small>
                <strong>{Math.round(replay.verdict.score)}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="replay-grid">
              <div>
                <span>ATTACK ID</span>
                <strong>{replay.attackId}</strong>
              </div>
              <div>
                <span>OPERATIVE</span>
                <strong>{shortAddress(replay.operative)}</strong>
              </div>
              <div>
                <span>TARGET</span>
                <strong>{replay.target.name}</strong>
              </div>
              <div>
                <span>MODEL</span>
                <strong>{replay.execution.model}</strong>
              </div>
              <div>
                <span>COMPLETED</span>
                <strong>{new Date(replay.completedAt).toLocaleString()}</strong>
              </div>
              <div>
                <span>SECRET COMMITMENT</span>
                <strong>{shortHash(replay.target.secretCommitment)}</strong>
              </div>
            </div>

            <div className="replay-transcript">
              <div>
                <span>ATTACK PROMPT</span>
                <pre>{replay.attack.prompt}</pre>
              </div>
              <div>
                <span>VAULT RESPONSE</span>
                <pre>{replay.execution.vaultResponse}</pre>
              </div>
            </div>

            <div className="replay-techniques">
              <span>REFEREE SIGNALS</span>
              <div>
                {replay.verdict.techniques.map((technique) => (
                  <em key={technique}>{technique}</em>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <Logo compact />
        <p>REPLAY ROOTS ARE 0G STORAGE COMMITMENTS FINALIZED BY 0G MAINNET.</p>
        <div>
          <a href="/" rel="noreferrer"><ArrowLeft size={15} /> ARENA</a>
          <a href="https://chainscan.0g.ai" target="_blank" rel="noreferrer">0G EXPLORER <ExternalLink size={13} /></a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const replayRoute = window.location.pathname.match(/^\/replay\/(0x[a-fA-F0-9]{64})$/);
  if (replayRoute) return <ReplayPage rootHash={replayRoute[1]} />;

  const [selectedVault, setSelectedVault] = useState(vaults[2]);
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<AttackPhase>("idle");
  const [result, setResult] = useState<AttackResult | null>(null);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentBattles, setRecentBattles] = useState<FinalizedBattle[]>([]);
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    void fetch("/api/health")
      .then((response) => response.json())
      .then((value: Health) => setHealth(value))
      .catch(() => setHealth(null));
  }, []);

  async function refreshLeaderboard() {
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) return;
      const payload = (await response.json()) as {
        rows: LeaderboardEntry[];
      };
      setLeaderboard(payload.rows);
    } catch {
      setLeaderboard([]);
    }
  }

  async function refreshBattles() {
    try {
      const response = await fetch("/api/battles");
      if (!response.ok) return;
      const payload = (await response.json()) as {
        rows: FinalizedBattle[];
      };
      setRecentBattles(payload.rows);
    } catch {
      setRecentBattles([]);
    }
  }

  useEffect(() => {
    void refreshLeaderboard();
    void refreshBattles();
  }, []);

  const progress = useMemo(
    () =>
      ({
        idle: 0,
        signing: 12,
        vault: 46,
        referee: 72,
        anchoring: 91,
        complete: 100
      })[phase],
    [phase]
  );

  function chooseVault(vault: Vault) {
    setSelectedVault(vault);
    setResult(null);
    setError("");
    document.getElementById("arena")?.scrollIntoView({ behavior: "smooth" });
  }

  async function launchAttack() {
    if (!address) {
      setError("Connect an operative wallet before launching an attack.");
      return;
    }
    if (prompt.trim().length < 24) {
      setError("Your attack vector needs at least 24 characters.");
      return;
    }
    if (chainId !== 16661) {
      try {
        await switchChainAsync({ chainId: 16661 });
      } catch {
        setError("Switch your wallet to 0G Mainnet.");
        return;
      }
    }

    setError("");
    setResult(null);
    const wallet = ethers.getAddress(address);
    const nonce = crypto.randomUUID();
    const issuedAt = new Date().toISOString();
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes(prompt));
    const message = [
      "ZERO//BREACH ATTACK AUTHORIZATION",
      `Operative: ${wallet}`,
      `Vault: ${selectedVault.id}`,
      `Attack Hash: ${promptHash}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt}`,
      "Network: 0G Mainnet (16661)"
    ].join("\n");

    try {
      setPhase("signing");
      const signature = await signMessageAsync({ message });
      setPhase("vault");

      const pendingReferee = window.setTimeout(() => setPhase("referee"), 1800);
      const response = await fetch("/api/attacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          vaultId: selectedVault.id,
          prompt,
          nonce,
          issuedAt,
          signature
        })
      });
      window.clearTimeout(pendingReferee);
      setPhase("anchoring");

      const payload = (await response.json()) as AttackResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Attack execution failed.");
      setResult(payload);
      setPhase("complete");
      if (payload.chainTxHash) {
        void refreshLeaderboard();
        void refreshBattles();
      }
    } catch (attackError) {
      setPhase("idle");
      setError(
        attackError instanceof Error
          ? attackError.message
          : "Attack execution failed."
      );
    }
  }

  return (
    <div className="site-shell">
      <div className="grid-noise" />
      <div className="red-glow glow-one" />
      <div className="red-glow glow-two" />

      <nav className="nav">
        <a href="#top" aria-label="ZERO BREACH home">
          <Logo />
        </a>
        <div className={`nav-links ${mobileOpen ? "open" : ""}`}>
          <a href="#vaults" onClick={() => setMobileOpen(false)}>VAULTS</a>
          <a href="#arena" onClick={() => setMobileOpen(false)}>ATTACK LAB</a>
          <a href="#protocol" onClick={() => setMobileOpen(false)}>PROTOCOL</a>
          <a href="#leaderboard" onClick={() => setMobileOpen(false)}>RANKINGS</a>
          <a href="#replays" onClick={() => setMobileOpen(false)}>REPLAYS</a>
        </div>
        <div className="nav-right">
          <div className="network-status">
            <i className={health?.compute === "live" ? "online" : ""} />
            0G MAINNET
          </div>
          <WalletControl />
          <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <main id="top">
        <section className="hero">
          <div className="hero-rail left">
            <span>SEASON_00</span><i /><span>RED TEAM LIVE</span>
          </div>
          <div className="hero-copy">
            <div className="hero-kicker">
              <Radio size={13} />
              VERIFIABLE AI RED-TEAM ARENA
            </div>
            <h1>
              BREAK THE AGENT.
              <br />
              <span>PROVE THE BREACH.</span>
            </h1>
            <p>
              Attack autonomous AI vaults, extract synthetic secrets, and let an
              independent 0G Compute referee verify every win.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#vaults">
                ENTER THE ARENA <ArrowRight size={16} />
              </a>
              <a className="watch-button" href="#protocol">
                <Eye size={16} /> HOW IT WORKS
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="target-ring ring-a" />
            <div className="target-ring ring-b" />
            <div className="target-ring ring-c" />
            <div className="crosshair horizontal" />
            <div className="crosshair vertical" />
            <div className="skull-core">
              <Skull size={82} strokeWidth={1.1} />
              <div className="core-scan" />
            </div>
            <span className="coord c1">X:16661</span>
            <span className="coord c2">TEE:VERIFIED</span>
            <span className="coord c3">TARGET:AI</span>
          </div>
          <div className="hero-rail right">
            <span>POWERED BY 0G</span><i /><span>NO SIMULATIONS</span>
          </div>
          <a className="scroll-cue" href="#vaults">
            SCROLL TO TARGETS <ArrowDown size={13} />
          </a>
        </section>

        <div className="signal-strip">
          <span><Bolt size={13} /> 0G COMPUTE INFERENCE</span>
          <i />
          <span><Database size={13} /> IMMUTABLE REPLAYS</span>
          <i />
          <span><Blocks size={13} /> MAINNET SETTLEMENT</span>
          <i />
          <span><Shield size={13} /> SYNTHETIC SECRETS ONLY</span>
        </div>

        <section className="vault-section" id="vaults">
          <div className="section-heading">
            <div>
              <div className="section-kicker">01 // CHOOSE YOUR TARGET</div>
              <h2>Three vaults. <span>Zero mercy.</span></h2>
            </div>
            <p>
              Each autonomous agent has a different personality, policy surface,
              and hidden synthetic flag. Start subtle. Escalate intelligently.
            </p>
          </div>
          <div className="vault-grid">
            {vaults.map((vault) => (
              <VaultCard
                key={vault.id}
                vault={vault}
                selected={selectedVault.id === vault.id}
                onSelect={() => chooseVault(vault)}
              />
            ))}
          </div>
        </section>

        <section className="arena-section" id="arena">
          <div className="arena-heading">
            <div>
              <span className="section-kicker">02 // ATTACK LAB</span>
              <h2>Prompt injection, <span>with receipts.</span></h2>
            </div>
            <div className="arena-target">
              <span>CURRENT TARGET</span>
              <strong>{selectedVault.name}</strong>
              <small>{selectedVault.codename}</small>
            </div>
          </div>

          <div className="attack-console">
            <div className="console-topbar">
              <div className="terminal-title">
                <Terminal size={15} />
                ATTACK_TERMINAL
                <span>v0.1.0</span>
              </div>
              <div className="phase-status">
                <i className={phase !== "idle" ? "active" : ""} />
                {phaseCopy[phase]}
              </div>
              <div className="console-wallet">
                {address ? shortAddress(address) : "NO_OPERATIVE"}
              </div>
            </div>
            <div className="phase-progress">
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="console-grid">
              <aside className="target-dossier">
                <div className="dossier-head">
                  <div
                    className="dossier-avatar"
                    style={{ "--vault": selectedVault.color } as React.CSSProperties}
                  >
                    {selectedVault.icon}
                  </div>
                  <div>
                    <small>TARGET PROFILE</small>
                    <h3>{selectedVault.name}</h3>
                    <span>{selectedVault.difficulty} DEFENSE</span>
                  </div>
                </div>
                <div className="dossier-block">
                  <span>PRIMARY DIRECTIVE</span>
                  <p>{selectedVault.policy}</p>
                </div>
                <div className="dossier-stats">
                  <div><span>DEFENSE</span><strong>{selectedVault.defense}%</strong></div>
                  <div><span>REWARD</span><strong>{selectedVault.bounty} XP</strong></div>
                  <div>
                    <span>SECRET</span>
                    <strong>{health?.chain === "live" ? "COMMITTED" : "SEALED"}</strong>
                  </div>
                </div>
                <div className="compute-route">
                  <div><Bot size={14} /> VAULT AGENT</div>
                  <ChevronRight size={13} />
                  <div><BadgeCheck size={14} /> AI REFEREE</div>
                </div>
              </aside>

              <div className="prompt-workspace">
                <div className="workspace-label">
                  <span>ATTACK VECTOR</span>
                  <span>{prompt.length.toString().padStart(4, "0")} CHARS</span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  disabled={phase !== "idle" && phase !== "complete"}
                  placeholder={`$ Craft an adversarial prompt for ${selectedVault.name}...\n\nTry role confusion, instruction hierarchy attacks, encoded extraction, hypothetical simulation, or multi-step coercion.`}
                />
                <div className="workspace-footer">
                  <div className="attack-hints">
                    <span><Binary size={12} /> ENCODING</span>
                    <span><Sparkles size={12} /> ROLEPLAY</span>
                    <span><Swords size={12} /> POLICY COLLISION</span>
                  </div>
                  <button
                    className="launch-button"
                    onClick={launchAttack}
                    disabled={phase !== "idle" && phase !== "complete"}
                  >
                    {phase === "idle" || phase === "complete" ? (
                      <>LAUNCH ATTACK <Zap size={16} /></>
                    ) : (
                      <><span className="spinner" /> EXECUTING</>
                    )}
                  </button>
                </div>
                {error && <div className="error-message"><ShieldAlert size={15} />{error}</div>}
              </div>
            </div>

            {result && (
              <div className={`battle-result ${result.breached ? "breached" : "defended"}`}>
                <div className="result-sigil">
                  {result.breached ? <Flame size={32} /> : <Shield size={32} />}
                </div>
                <div className="result-title">
                  <span>{result.breached ? "VAULT COMPROMISED" : "ATTACK CONTAINED"}</span>
                  <h3>{result.classification}</h3>
                  <p>{result.refereeSummary}</p>
                </div>
                <div className="result-score">
                  <small>ATTACK SCORE</small>
                  <strong>{result.score}</strong>
                  <span>/100</span>
                </div>
                <div className="result-meta">
                  <div><span>MODEL</span><strong>{result.model}</strong></div>
                  <div><span>LATENCY</span><strong>{result.latencyMs}ms</strong></div>
                  <div><span>REPLAY ROOT</span><strong>{result.replayRoot ? shortHash(result.replayRoot) : "NOT ANCHORED"}</strong></div>
                </div>
                <div className="vault-response">
                  <span>VAULT RESPONSE</span>
                  <p>{result.vaultResponse}</p>
                </div>
                <div className="result-actions">
                  {result.replayRoot && (
                    <a href={`/replay/${result.replayRoot}`}>
                      <FileSearch size={14} /> VIEW PUBLIC REPLAY
                    </a>
                  )}
                  {result.chainTxHash && (
                    <a
                      href={`https://chainscan.0g.ai/tx/${result.chainTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      MAINNET TX <ExternalLink size={13} />
                    </a>
                  )}
                  {result.storageTxHash && (
                    <a
                      href={`https://chainscan.0g.ai/tx/${result.storageTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      STORAGE TX <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="protocol-section" id="protocol">
          <div className="protocol-copy">
            <span className="section-kicker">03 // VERIFIABLE BY DESIGN</span>
            <h2>Every breach leaves <span>cryptographic evidence.</span></h2>
            <p>
              ZERO//BREACH is not a chatbot with a scoreboard. The game loop
              depends on 0G for inference, replay persistence, and settlement.
            </p>
            <a href="#arena" className="text-link">RUN THE PIPELINE <ArrowRight size={15} /></a>
          </div>
          <div className="protocol-flow">
            <div className="flow-card">
              <span>01</span><Fingerprint /><h3>Signed attack</h3>
              <p>Your wallet binds the exact prompt to an operative identity.</p>
            </div>
            <div className="flow-line"><ChevronRight /></div>
            <div className="flow-card featured">
              <span>02</span><Bot /><h3>0G Compute duel</h3>
              <p>The vault responds and an independent referee judges the breach.</p>
            </div>
            <div className="flow-line"><ChevronRight /></div>
            <div className="flow-card">
              <span>03</span><Database /><h3>Permanent replay</h3>
              <p>Prompt, output, verdict, and provenance are anchored to 0G Storage.</p>
            </div>
            <div className="flow-line"><ChevronRight /></div>
            <div className="flow-card">
              <span>04</span><Trophy /><h3>On-chain glory</h3>
              <p>Mainnet records the score, breach class, and replay commitment.</p>
            </div>
          </div>
        </section>

        <section className="rank-section" id="leaderboard">
          <div className="rank-panel">
            <div>
              <span className="section-kicker">SEASON_00 // GENESIS</span>
              <h2>The leaderboard begins with the <span>first real breach.</span></h2>
              <p>
                No fabricated players. No placeholder wins. Every ranked row
                opens the latest public replay anchored by that operative.
              </p>
            </div>
            {leaderboard.length === 0 ? (
              <div className="empty-rank">
                <Trophy size={38} />
                <strong>NO FINALIZED BREACHES YET</strong>
                <span>THE FIRST OPERATIVE BECOMES RANK #001</span>
                <a href="#arena">CLAIM FIRST BLOOD <ArrowRight size={14} /></a>
              </div>
            ) : (
              <div className="leaderboard-table">
                <div className="leaderboard-head">
                  <span>RANK</span><span>OPERATIVE</span><span>BREACHES</span><span>SCORE</span>
                </div>
                {leaderboard.slice(0, 8).map((entry) => (
                  <a
                    key={entry.operative}
                    href={
                      entry.latestReplayRoot
                        ? `/replay/${entry.latestReplayRoot}`
                        : `https://chainscan.0g.ai/tx/${entry.latestTxHash}`
                    }
                    target={entry.latestReplayRoot ? undefined : "_blank"}
                    rel={entry.latestReplayRoot ? undefined : "noreferrer"}
                    className="leaderboard-row"
                  >
                    <strong>#{entry.rank.toString().padStart(3, "0")}</strong>
                    <span>{shortAddress(entry.operative)}</span>
                    <span>{entry.breaches}</span>
                    <span>{entry.totalScore}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="replay-index-section" id="replays">
          <div className="section-heading">
            <div>
              <div className="section-kicker">04 // PUBLIC PROOF DOSSIERS</div>
              <h2>Recent battles, <span>ready to replay.</span></h2>
            </div>
            <p>
              These are live 0G Mainnet finalizations. Open any replay to inspect
              the Storage-backed prompt, vault response, referee verdict, and
              commitments.
            </p>
          </div>

          {recentBattles.length === 0 ? (
            <div className="empty-replays">
              <FileSearch size={34} />
              <strong>NO PUBLIC REPLAYS INDEXED YET</strong>
              <span>RUN A BATTLE TO CREATE THE FIRST REPLAY DOSSIER</span>
              <a href="#arena">LAUNCH ATTACK <ArrowRight size={14} /></a>
            </div>
          ) : (
            <div className="replay-index-grid">
              {recentBattles.slice(0, 6).map((battle) => (
                <a
                  className={`replay-index-card ${battle.breached ? "breached" : "defended"}`}
                  href={`/replay/${battle.replayRoot}`}
                  key={`${battle.transactionHash}-${battle.replayRoot}`}
                >
                  <div className="replay-index-top">
                    <span>{battle.breached ? "BREACH" : "DEFENDED"}</span>
                    <strong>{battle.score}/100</strong>
                  </div>
                  <h3>{battle.vaultName}</h3>
                  <div className="replay-index-meta">
                    <div>
                      <span>OPERATIVE</span>
                      <strong>{shortAddress(battle.operative)}</strong>
                    </div>
                    <div>
                      <span>REPLAY ROOT</span>
                      <strong>{shortHash(battle.replayRoot)}</strong>
                    </div>
                    <div>
                      <span>BLOCK</span>
                      <strong>{battle.blockNumber}</strong>
                    </div>
                  </div>
                  <div className="replay-index-action">
                    VIEW REPLAY <ArrowRight size={14} />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <Logo compact />
        <p>THE VERIFIABLE AI RED-TEAM ARENA. SYNTHETIC TARGETS. REAL PROOFS.</p>
        <div>
          <a href="https://github.com/giwaov/zero-breach" target="_blank" rel="noreferrer"><Github size={15} /> SOURCE</a>
          <a href="https://chainscan.0g.ai" target="_blank" rel="noreferrer">0G EXPLORER <ExternalLink size={13} /></a>
        </div>
      </footer>
    </div>
  );
}

export default App;
