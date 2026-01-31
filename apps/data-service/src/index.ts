import {WorkerEntrypoint} from 'cloudflare:workers';
import {App} from "./hono/app";
import {initDatabase} from "@repo/data-ops/database";
import {QueueMessageSchema} from "@repo/data-ops/zod-schema/queue";
import {handleLinkClick} from "@/queue-handlers/link-clicks";

/**
 * This is a worker entry point. It's a class based setup
 */
export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		initDatabase(env.DB)
	}

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

	/**
	 * This is the handler (consumer) for the queue
	 * @param batch
	 */
	async queue(batch: MessageBatch<unknown>) {
		for (const message of batch.messages) {
			console.log("Queue Event: ", message.body);
			// we parse it to ensure it's of a certain type. We only want to handle messages we support
			const parsedEvent = QueueMessageSchema.safeParse(message.body);
			if (parsedEvent.success) {
				const event = parsedEvent.data;
				if (event.type === "LINK_CLICK") {
					// await handleLinkClick(this.env, event)
					throw new Error("Test Error For Dead Letter Queue");
				}
			} else {
				// you could take this to some reporting app like sentry or in your own database
				console.error(parsedEvent.error)
			}

			// you can manually ack the message
			// message.ack()
		}
	}
}

