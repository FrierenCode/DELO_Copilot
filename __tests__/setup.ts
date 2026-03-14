import { vi } from "vitest";

// Provide crypto.subtle for hash-input.ts (Node 18+ has it on globalThis)
// If running Node < 18, polyfill it here.
if (typeof globalThis.crypto === "undefined") {
  const { webcrypto } = await import("crypto");
  (globalThis as unknown as { crypto: typeof webcrypto }).crypto = webcrypto;
}

// Silence console output during tests — remove if you want verbose output
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});
