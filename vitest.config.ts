import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    // marketing-vault/releases holds packaged copies of the app. Testing them
    // would run every suite twice and report failures against a snapshot rather
    // than the source you are editing.
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "marketing-vault/releases/**"],
  },
});
