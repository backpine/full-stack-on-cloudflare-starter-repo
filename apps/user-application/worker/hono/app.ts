import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { appRouter } from "../trpc/router";
import { createContext } from "../trpc/context";

export const App = new Hono<{ Bindings: ServiceBindings }>();

App.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () =>
      createContext({ req: c.req.raw, env: c.env, workerCtx: c.executionCtx }),
  });
});

App.get("/click-socket", async (c) => {
  const headers = new Headers(c.req.raw.headers);
  headers.set("account-id", "1234567890");
  const proxiedRequest = new Request(c.req.raw, { headers });
  return c.env.BACKEND_SERVICE.fetch(proxiedRequest);
});
