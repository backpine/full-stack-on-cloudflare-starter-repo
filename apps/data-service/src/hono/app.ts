import { Hono } from 'hono';
import { cloudflareInfoSchema } from "@repo/data-ops/zod-schema/links";
import {getDestinationForCountry, getRoutingDestinations} from "@/helpers/route-ops";
import { LinkClickMessageType } from "@repo/data-ops/zod-schema/queue";

export const App = new Hono<{Bindings: Env}>();

// This was the original version of this which was a hello world of the DO
// App.get("/do/:name", async (c) => {
// 	const name = c.req.param("name");
// 	const doId = c.env.EVALUATION_SCHEDULER.idFromName(name);
//
//
// 	const stub = c.env.EVALUATION_SCHEDULER.get(doId);
// 	// we now have an instance of the DO
// 	await stub.increment();
//
// 	const count = await stub.getCount();
//
// 	return c.json({
// 		count
// 	});
// })

/**
 * We redirect the user AND kick off a fire and forget event on the queue so that this redirect is fast as possible
 * We ensure the change is still tracked but we decouple the speed to process that from the actual redirect.
 * This is the magic of queues
 */
App.get('/:id', async (c) => {
	const id = c.req.param('id');
	const link = await getRoutingDestinations(c.env, id)
	if(!link){
		return c.text('Destination not found', 404);
	}
	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if(cfHeader.success === false){
		return c.text('Invalid CF header', 400);
	}

	const headers = cfHeader.data;
	const destination = getDestinationForCountry(link, headers.country);

	const queueMessage: LinkClickMessageType = {
		"type": "LINK_CLICK",
		"data": {
			id: id,
			// I just this to make the type happy, not sure what it's for or if it's the right field.
			accountId: id,
			country: headers.country,
			destination:  link.accountId,
			latitude: headers.latitude,
			longitude: headers.longitude,
			timestamp: new Date().toISOString(),
		}
	}
	/**
	 * This will take a few ms to send and get an ack from the queue with `await`
	await c.env.QUEUE.send(queueMessage); // we could do //sendBatch() so that we can send many at once, if needed.
	 we use waitUntil to ensure the serverless platform will do this without holding up the execution of the endpoint, we want to prioritize responsiveness
	 this will run in the background; however, there are some edge cases where this doesn't work. If you need to ensure that we don't lose it, then DON'T USE THIS.
	 it's great for less critical tasks like analytics
	 */
	c.executionCtx.waitUntil(
		c.env.QUEUE.send(queueMessage, {
			// You won't have to parse this if you specify it. The lib will do it for you
			// contentType: "json",
			/**
			// the data goes to the queue but isn't processed by the consumer. E.g. twilio api to send sms texts
			 * Stick the twilio id in the queue. and then wait 10 minutes
			 * You can then check the id in the future to see how the twilio message is in state
			 */
			// delaySeconds: 10 * 66
		})
	)

	return c.redirect(destination);
})

// -----------
// we are starting over with a more simple solution
// /**
//  * this is a dynamic id
//  * c will give the contenxt for hono. It will give access to the env, request, response
//  */
// App.get("/:id", async (c) => {
// 	/**
// 	 * We need to use the headers on the req
// 	 * Hono will add some helper methods at this point
// 	 * It can provide the c.req.raw from the cloudflare request
// 	 */
//
// 	const regularHeaders = c.req.raw.headers;
// 	console.log(JSON.stringify(c.req.raw.headers))
//
// 	/**
// 	 * This has a lot of useful info that CF will provide. Check out cf.mock.jsonc for an actual example
// 	 */
// 	const cfHeaders = c.req.raw.cf;
// 	console.log(JSON.stringify(cfHeaders))
//
// 	const country = cfHeaders?.country;
// 	const lat = cfHeaders?.latitude;
// 	const lng = cfHeaders?.longitude;
//
// 	return c.json({
// 		country,
// 		lat,
// 		lng
// 	})
// });
//

