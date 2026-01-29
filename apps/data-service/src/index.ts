import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from "./hono/app";

/**
 * This is a worker entry point. It's a class based setup
 */
export default class DataService extends WorkerEntrypoint<Env> {
	fetch(request: Request) {
		// return new Response('Hello World!');

		/** We return this so that it's more clear on how the entry point is working
		 * It works with web requests but also cloudflare specific workings as well
		 */
		return App.fetch(request, this.env, this.ctx);
	}

	/**
	 * There are other hooks like queue, scheduled etc for other types of compute primitives
	 */
}
