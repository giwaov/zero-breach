import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const zeroGMainnet = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
  blockExplorers: {
    default: { name: "0G Chainscan", url: "https://chainscan.0g.ai" }
  }
});

export const walletConfig = getDefaultConfig({
  appName: "ZERO//BREACH",
  appDescription: "The verifiable AI red-team arena.",
  appUrl: "https://zero-breach.vercel.app",
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
    "00000000000000000000000000000000",
  chains: [zeroGMainnet],
  ssr: false
});
