import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase } from '@repo/data-ops/database';
import { QueueMessageSchema } from '@repo/data-ops/zod-schema/queue';
import { handleLinkClick } from './queue-handlers/link-clicks';
export  { DestinationEvaluationWorkflow } from './workflows/destination-evalutation-workflow';
export { EvaluationScheduler} from "@/durable-objects/evaluation-scheduler";
export { LinkClickTracker } from "@/durable-objects/link-click-tracker";


export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx:ExecutionContext, env: Env) {
		super(ctx, env); // Call the parent constructor
		initDatabase(env.DB); // Initialize the database with the provided environment variable
	} // constructor
	fetch(request: Request) {
	
		return App.fetch(request,this.env,this.ctx); // Delegate HTTP requests to the Hono app
	}
async queue(batch: MessageBatch<unknown>) {

	for (const message of batch.messages) {
		const parsedEvent = QueueMessageSchema.safeParse(message.body);
		if(parsedEvent.success) {
			const event = parsedEvent.data;
			if(event.type === 'LINK_CLICK' ) {
				await handleLinkClick(this.env, event);

			} // if event type === 'LINK_CLICK' saves link click data and schedules eval workflow

		} else {
			console.error('Invalid message received in queue:', parsedEvent.error);
		}
		
	}
		
	} // what does this queue do? 
	// This queue method processes a batch of messages received from a queue. For each message, it attempts to parse the message body using a predefined schema (QueueMessageSchema). If the parsing is successful and the event type is "LINK_CLICK", it calls the handleLinkClick function to process the link click event using the provided environment variables. If the parsing fails, it logs an error message indicating that an invalid message was received. Overall, this method handles link click events in a structured manner, ensuring that only valid messages are processed.
	 

}
 // what does this code do 
// This code defines a Cloudflare Worker named DataService that serves as the entry point for handling HTTP requests and processing queue messages. It initializes a database connection using the provided environment variables and sets up routing for incoming HTTP requests through the Hono framework. The worker also processes messages from a queue, specifically handling "LINK_CLICK" events by invoking the appropriate handler function. Overall, it integrates web request handling and background message processing in a serverless environment.