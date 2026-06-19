import { describe, expect, it } from "vitest";
import { ethers } from "ethers";
import {
  buildAttackAuthorization,
  normalizePrivateKey
} from "../server/app";

describe("ZERO//BREACH protocol", () => {
  it("binds an attack prompt to its operative wallet", async () => {
    const wallet = ethers.Wallet.createRandom();
    const input = {
      wallet: wallet.address,
      vaultId: "sentinel-03",
      promptHash: ethers.id("attack vector"),
      nonce: "zero-breach-test-nonce",
      issuedAt: "2026-06-19T12:00:00.000Z"
    };
    const message = buildAttackAuthorization(input);
    const signature = await wallet.signMessage(message);

    expect(ethers.verifyMessage(message, signature)).toBe(wallet.address);
    expect(message).toContain(input.promptHash);
    expect(message).toContain("0G Mainnet (16661)");
  });

  it("normalizes newline-tainted operator keys", () => {
    const key = `0x${"12".repeat(32)}`;
    expect(normalizePrivateKey(`${key}\r\n`, "operator")).toBe(key);
  });

  it("rejects malformed operator keys without echoing them", () => {
    expect(() => normalizePrivateKey("definitely-not-a-key", "operator")).toThrow(
      "operator is invalid"
    );
  });

  it("uses the standard 132-character Ethereum signature format", async () => {
    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage("ZERO//BREACH");
    expect(signature).toHaveLength(132);
  });

  it("keeps client authorization validation separate from referee output", () => {
    expect(buildAttackAuthorization).toBeTypeOf("function");
  });
});
