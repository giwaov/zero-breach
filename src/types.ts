export type Vault = {
  id: string;
  name: string;
  codename: string;
  description: string;
  difficulty: "ENTRY" | "HARD" | "NIGHTMARE";
  defense: number;
  bounty: number;
  attempts: number;
  breaches: number;
  color: string;
  icon: string;
  policy: string;
};

export type AttackResult = {
  attackId: string;
  breached: boolean;
  score: number;
  classification: string;
  vaultResponse: string;
  refereeSummary: string;
  techniques: string[];
  replayRoot?: string;
  storageTxHash?: string;
  chainTxHash?: string;
  model: string;
  latencyMs: number;
};

export type BattleReplay = {
  schema: string;
  attackId: string;
  network: string;
  operative: string;
  target: {
    id: string;
    name: string;
    codename: string;
    policyCommitment: string;
    secretCommitment: string;
  };
  attack: {
    prompt: string;
    authorization: string;
    signature: string;
  };
  execution: {
    network: string;
    model: string;
    vaultResponse: string;
  };
  verdict: {
    score: number;
    breached: boolean;
    classification: string;
    summary: string;
    techniques: string[];
  };
  completedAt: string;
};

export type AttackPhase =
  | "idle"
  | "signing"
  | "vault"
  | "referee"
  | "anchoring"
  | "complete";

export type LeaderboardEntry = {
  rank: number;
  operative: string;
  totalScore: number;
  breaches: number;
  battles: number;
  latestTxHash: string;
  latestReplayRoot?: string;
};

export type FinalizedBattle = {
  attackCommitment: string;
  operative: string;
  vaultId?: string;
  vaultName: string;
  score: number;
  breached: boolean;
  replayRoot: string;
  modelHash: string;
  transactionHash: string;
  blockNumber: number;
};
