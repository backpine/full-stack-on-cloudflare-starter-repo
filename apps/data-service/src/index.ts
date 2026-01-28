import { WorkerEntrypoint } from "cloudflare:workers";
import { App } from "./hono/app";

export default class DataService extends WorkerEntrypoint<Env> {
	fetch(request: Request) {
		return App.fetch(request, this.env, this.ctx);
	}
}
