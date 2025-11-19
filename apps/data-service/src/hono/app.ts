import { captureLinkClickInBackground, getDestinationForCountry, getRoutingDestinations } from "@/helpers/route-ops";
import { getLink } from "@repo/data-ops/queries/links";
import { cloudflareInfoSchema } from "@repo/data-ops/zod-schema/links";
import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";
import { Hono } from "hono";
import moment from "moment";
export { EvaluationScheduler} from "@/durable-objects/evaluation-scheduler";

export const App = new Hono<{Bindings: Env}>();
App.get('/click-socket', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
	if (!upgradeHeader || upgradeHeader !== 'websocket') {
		return c.text('Expected Upgrade: websocket', 426);
	}

  const accountId = c.req.header('account-id')

  if (!accountId) return  c.text('No Headers', 404);
  const doId = c.env.LINK_CLICK_TRACKER_OBJECT.idFromName(accountId);
	const stub = c.env.LINK_CLICK_TRACKER_OBJECT.get(doId);
  return await stub.fetch(c.req.raw)
})

App.get('/:id', async (c) => {
    const id = c.req.param('id');

    const linkInfo = await getRoutingDestinations(c.env, id);
    if(!linkInfo) {
        return c.text('Link not found', 404);
    }
    const cfHeaders = cloudflareInfoSchema.safeParse(c.req.raw.cf)
    if(!cfHeaders.success) {
        return c.text('Invalid Cloudflare headers', 400);


    }
    
    const headers = cfHeaders.data
    const destination  = getDestinationForCountry(linkInfo, headers.country);
    const queMessage:LinkClickMessageType = {
        'type':'LINK_CLICK',
        data:{
            id: id,
            country: headers.country,
            destination: destination,
            accountId: linkInfo.accountId,
            latitude: headers.latitude,
            longitude: headers.longitude,
            timestamp: new Date().toISOString()
        }

    }
 
c.executionCtx.waitUntil(
captureLinkClickInBackground(c.env, queMessage)
); //


 return c.redirect(destination);


});

