// this will be available through out the entire context of the worker
interface DestinationStatusEvaluationParams {
	linkId: string;
	destinationUrl: string;
	accountId: string;
}

interface Env extends Cloudflare.Env {
	DESTINATION_EVALUATION_WORKFLOW: Workflow<DestinationStatusEvaluationParams>;
}
