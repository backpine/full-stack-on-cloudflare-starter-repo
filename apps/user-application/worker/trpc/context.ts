export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: ServiceBindings;
  workerCtx: ExecutionContext;
}) {
  return {
    req,
    env,
    workerCtx,
    userInfo: {
      userId: "1234567890",
    },
  };
}


export type Context = Awaited<ReturnType<typeof createContext>>;
// runs in every request to create the context object