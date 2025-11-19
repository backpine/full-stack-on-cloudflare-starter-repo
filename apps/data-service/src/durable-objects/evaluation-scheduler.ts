import { DurableObject } from 'cloudflare:workers';
import moment from 'moment';
interface ClickData {
    accountId:string
    linkId:string
    destinationUrl:string
    destinatinCountryCode:string
}
export class EvaluationScheduler extends DurableObject<Env> {
    clickData: ClickData | undefined


    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env)
        ctx.blockConcurrencyWhile(async () => {
            this.clickData = await ctx.storage.get<ClickData>('click_data'); // initialize state from storage
        
        }) 
    }

    async  collectLinkClick(accountId:string, linkId:string, destinationUrl:string, destinatinCountryCode:string) {
   this.clickData = {
            accountId,
            linkId,
            destinationUrl,
            destinatinCountryCode
        } // update in-memory state
        await this.ctx.storage.put('click_data', this.clickData); // persist state to storage
        const alarm = await this.ctx.storage.getAlarm()
        if(!alarm) {
            const tenSeconds = moment().add(24, 'hour').valueOf()
            await this.ctx.storage.setAlarm(tenSeconds); // set alarm for 24 hours later
        }
      
      
    }
    async alarm(){
        console.log('Alarm triggered at', new Date().toISOString());
        const clickData = this.clickData
        if(!clickData){
            throw new Error('No click data found');
        }
        
        await this.env.DESTINATION_EVALUATION_WORKFLOW.create({
            params:{
                linkId: clickData.linkId,
                destinationUrl: clickData.destinationUrl,
                accountId: clickData.accountId

            }
        })
    }

  


}
 // this durable object is used to schedule evaluations at regular intervals
