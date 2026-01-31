import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import puppeteer from "@cloudflare/puppeteer";


/**
 * This is to tap into the workflow engine. It's using the DestinationStatus... from the service bindings
 */
export class DestinationEvaluationWorkflow extends WorkflowEntrypoint<Env, DestinationStatusEvaluationParams> {
	async run(event: Readonly<WorkflowEvent<DestinationStatusEvaluationParams>>, step: WorkflowStep) {

		const collectedData = await step.do("Collect rendered destination page data", async () => {
			/**
			 * This is the cloudflare way of standing up a browser
			 */
			const browser = await puppeteer.launch(this.env.VIRTUAL_BROWSER)

			// now we can do other browser specific things
			const page = await browser.newPage();
			// make sure the service bindings updates to have url
			const response = await page.goto(event.payload.destinationUrl);

			await page.waitForNetworkIdle();

			const bodyText = (await page.$eval('body', (el) => el.innerText)) as string;

			// this is provided by puppeteer
			const html = await page.content();

			const status = response ? response.status() : 0;

			await browser.close();

			return {
				bodyText,
				html,
				status
			}
		});
		console.log(collectedData);
	}
}
