import { initDatabase } from "@repo/data-ops/database";

export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: ServiceBindings;
  workerCtx: ExecutionContext;
}) {
  // Initialize the database with the D1 binding
  initDatabase(env.DB);

  return {
    req,
    env,
    workerCtx,
    // TODO: Replace with actual user authentication
    userInfo: {
      userId: "1234567890",
      accountId: "account_default",
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
