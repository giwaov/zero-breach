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

export type AttackPhase =
  | "idle"
  | "signing"
  | "vault"
  | "referee"
  | "anchoring"
  | "complete";
