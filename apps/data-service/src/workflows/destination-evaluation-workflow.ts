import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';


/**
 * This is to tap into the workflow engine
 */
export class DestinationEvaluationWorkflow extends WorkflowEntrypoint<Env, unknown> {
	async run(event: Readonly<WorkflowEvent<unknown>>, step: WorkflowStep) {

		const collectedData = await step.do("Collect rendered destination page data", async () => {
			console.log("Collecting rendered destination page data");
			return {
				"dummydata": "dummydata",

			}
		});
		console.log(collectedData);
	}
}
