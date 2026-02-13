import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import {collectDestinationInfo} from "@/helpers/browser-render";
import {aiDestinationChecker} from "@/helpers/ai-destination-checker";
import { addEvaluation } from "@repo/data-ops/queries/evalutations";
import { initDatabase } from '@repo/data-ops/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * This is to tap into the workflow engine. It's using the DestinationStatus... from the service bindings
 *
 */
export class DestinationEvaluationWorkflow extends WorkflowEntrypoint<Env, DestinationStatusEvaluationParams> {
	async run(event: Readonly<WorkflowEvent<DestinationStatusEvaluationParams>>, step: WorkflowStep) {
		initDatabase(this.env.DB)

		const evaluationInfo = await step.do(
			'Collect rendered destination page data',
			{
				retries: {
					limit: 1,
					delay: 1000,
				},
			},
			async () => {
				const evaluationId = uuidv4();
				const data = await collectDestinationInfo(this.env, event.payload.destinationUrl);
				const accountId = event.payload.accountId;
				const r2PathHtml = `evaluations/${accountId}/html/${evaluationId}`;
				const r2PathBodyText = `evaluations/${accountId}/body-text/${evaluationId}`;
				const r2PathScreenshot = `evaluations/${accountId}/screenshots/${evaluationId}.png`;

				// Convert base64 data URL to buffer for R2 storage
				const screenshotBase64 = data.screenshotDataUrl.replace(/^data:image\/png;base64,/, '');
				const screenshotBuffer = Buffer.from(screenshotBase64, 'base64');

				await this.env.BUCKET.put(r2PathHtml, data.html);
				await this.env.BUCKET.put(r2PathBodyText, data.bodyText);
				await this.env.BUCKET.put(r2PathScreenshot, screenshotBuffer);
				return {
					bodyText: data.bodyText,
					evaluationId: evaluationId,
				};
			},
		);

		// we are going to pass this along to an ai workflow
		const aiStatus = await step.do(
			'Use AI to check status of page',
			{
				retries: {
					limit: 0,
					delay: 0,
				},
			},
			async () => {
				return await aiDestinationChecker(this.env, evaluationInfo.bodyText);
			},
		);

		// we save this into an object store to bypass limits for workflows
		await step.do('Save evaluation in database', async () => {
			return await addEvaluation({
				evaluationId: evaluationInfo.evaluationId,
				linkId: event.payload.linkId,
				status: aiStatus.status,
				reason: aiStatus.statusReason,
				accountId: event.payload.accountId,
				destinationUrl: event.payload.destinationUrl,
			});
		});
	}
}

/**
 * Example input params:
  {
  "linkid": "testid",
  "destinationUrl": "https://www.aliexpress.us/item/3256807855533534.html?spm=a2g0o.productlist.main.2.4ac2129cS7Fw5l&algo_pvid=d9a18b39-b111-43ba-a164-2303b305b51f&algo_exp_id=d9a18b39-b111-43ba-a164-2303b305b51f-1&pdp_ext_f={%22order%22%3A%22610%22%2C%22eval%22%3A%221%22%2C%22fromPage%22%3A%22search%22}&pdp_npi=6%40dis!USD!1043.75!252.34!!!7203.24!1741.48!%402103212b17705165836294275ea4fa!12000043612523513!sea!US!0!ABX!1!0!n_tag%3A-29910%3Bd%3Aae9494bd%3Bm03_new_user%3A-29895%3BpisId%3A5000000200565977&curPageLogUid=LqtsSI5gs6yg&utparam-url=scene%3Asearch|query_from%3A|x_object_id%3A1005008041848286|_p_origin_prod%3A",
  "accountId": "testaccoundid"
  }
 */
