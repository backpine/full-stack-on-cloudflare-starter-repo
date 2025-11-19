import { initDatabase } from "@repo/data-ops/database";
import { App } from "./hono/app";

export default {
  fetch(request, env, ctx) {
    initDatabase(env.DB);
    return App.fetch(request, env, ctx)
  },
} satisfies ExportedHandler<ServiceBindings>;
