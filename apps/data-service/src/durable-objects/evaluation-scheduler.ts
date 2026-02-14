import { DurableObject } from "cloudflare:workers";

interface ClickData {
	accountId: string;
	linkId: string;
	destinationUrl: string;
	destinationCountryCode: string;
}

export class EvaluationScheduler extends DurableObject {
	clickData: ClickData | undefined;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		// avoid race conflict
		ctx.blockConcurrencyWhile(async () => {
			this.clickData = await ctx.storage.get<ClickData>('click_data');
		})
	}

	async collectLinkClick(accountId: string, linkId: string, destinationUrl: string, destinationCountryCode: string) {
		this.clickData = {
			accountId,
			linkId,
			destinationUrl,
			destinationCountryCode
		};

		// flush this to storage so we don't lose it when the DO goes idle.
		await this.ctx.storage.put('click_data', this.clickData);

		// we don't necessarily want to run the workflow each time, so we should use an alarm with a trigger condition that will instead invoke the workflow
		// this.env.DESINATION_EVALUATION_WORKFLOW.create()

		// a simple scheduler into the future
		const alarm = await this.ctx.storage.getAlarm()
		if(!alarm) {
			const tenSeconds = Date.now() + 10000;
			await this.ctx.storage.setAlarm(tenSeconds);
		}
	}

	async alarm() {
		console.log('Evaluation scheduler alarm triggered');
		const clickData = this.clickData;
		if(!clickData) {
			// we don't expect this to happen, just guarding
			throw new Error('No click data found');
		}
		// recall that we have to update service bindings ts file so that it's typed
		// there are input props in a workflow that we can't get type hints because it can't pick it up, so we define it
		await this.env.DESINATION_EVALUATION_WORKFLOW.create({
			params: {
				linkId: clickData?.linkId,
				accountId: clickData.accountId,
				destinationUrl: clickData.destinationUrl
			}
		})
	}
}

// import { DurableObject } from "cloudflare:workers";
//
// export class EvaluationScheduler extends DurableObject {
// 	count: number = 0;
//
// 	constructor(ctx: DurableObjectState, env: Env) {
// 		super(ctx, env);
// 		// avoid race conflict
// 		ctx.blockConcurrencyWhile(async () => {
// 			this.count = await ctx.storage.get("count") || this.count;
// 		})
//
// 	}
//
// 	async increment() {
// 		this.count++;
// 		await this.ctx.storage.put("count", this.count);
// 	}
//
// 	async getCount() {
// 		return this.count;
// 	}
// }
