import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import {collectDestinationInfo} from "@/helpers/browser-render";


/**
 * This is to tap into the workflow engine. It's using the DestinationStatus... from the service bindings
 */
export class DestinationEvaluationWorkflow extends WorkflowEntrypoint<Env, DestinationStatusEvaluationParams> {
	async run(event: Readonly<WorkflowEvent<DestinationStatusEvaluationParams>>, step: WorkflowStep) {

		const collectedData = await step.do("Collect rendered destination page data", async () => {
			return collectDestinationInfo(this.env, event.payload.destinationUrl);
		});

		// we are going to pass this along to an ai workflow
		console.log(collectedData);
	}
}
