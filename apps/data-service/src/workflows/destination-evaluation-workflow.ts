import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { collectDestinationInfo } from '@/helpers/browser-render';

export class DestinationEvaluationWorkflow extends WorkflowEntrypoint<Env, DestinationStatusEvaluationParams> {
    async run(event: Readonly<WorkflowEvent<DestinationStatusEvaluationParams>>, step: WorkflowStep) {

        const collectedData = await step.do("Collect rendered destination page data", async () => {
            return collectDestinationInfo(this.env, event.payload.destinationUrl);
        });

        console.log(collectedData);
    }
}
