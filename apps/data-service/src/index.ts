import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app'
import { initDatabase } from '@repo/data-ops/database'
import { QueueMessageSchema } from '@repo/data-ops/zod-schema/queue'
import { handleLinkClick } from './queue-handlers/link-clicks'
export { DestinationEvaluationWorkflow } from './workflows/destination-evaluation-workflows'
export { EvaluationScheduler } from "@/durable-objects/evaluation-scheduler";
export { LinkClickTracker } from "@/durable-objects/link-click-tracker";


export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env)
		initDatabase(env.DB)
	}

	fetch(request: Request) {
		return App.fetch(request, this.env, this.ctx);
	}

	async queue(batch: MessageBatch<unknown>) {
		for (const message of batch.messages) {
			const parsedEvent = QueueMessageSchema.safeParse(message.body)
			if (!parsedEvent.success) {
				console.error("Invalid queue message: ", message.body)
				continue
			}
			const event = parsedEvent.data
			if (event.type === "LINK_CLICK") {
				await handleLinkClick(this.env, event)
				//throw new Error("LINK_CLICK")
			}
			console.log("Queue Event: ", message.body)
		}
	}
}
