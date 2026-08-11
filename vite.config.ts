import { cloudflare } from "@cloudflare/vite-plugin";
import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const configuredHosting = hostingConfig as { d1?: string | null; r2?: string | null };
const SITE_CREATOR_PLACEHOLDER_DATABASE_ID = "00000000-0000-4000-8000-000000000000";

const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: {
          main: "./worker/index.ts",
          compatibility_flags: ["nodejs_compat"],
          d1_databases: configuredHosting.d1
            ? [
                {
                  binding: configuredHosting.d1,
                  database_name: "mizan-personal-budget",
                  database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
                },
              ]
            : [],
          r2_buckets: configuredHosting.r2
            ? [{ binding: configuredHosting.r2, bucket_name: "mizan-personal-budget" }]
            : [],
        },
      }),
    ],
  };
});
