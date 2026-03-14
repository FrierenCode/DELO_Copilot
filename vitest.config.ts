import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["__tests__/setup.ts"],
    include: ["__tests__/**/*.test.ts"],
    exclude: ["node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // server-only is a Next.js runtime guard — no-op in tests
      "server-only": path.resolve(__dirname, "__tests__/mocks/server-only.ts"),
      // next/headers is not available in test env
      "next/headers": path.resolve(__dirname, "__tests__/mocks/next-headers.ts"),
    },
  },
});
