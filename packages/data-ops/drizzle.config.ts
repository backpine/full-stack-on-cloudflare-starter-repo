import type { Config } from "drizzle-kit";

const config: Config = {
  out: "./src/drizzle-out",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || "4133faf9-343a-4ed0-8f83-1550cd0ab04f",
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
  tablesFilter: ["!_cf_KV"],
};

export default config satisfies Config;
