import { getDestinationForCountry, getRoutingDestinations } from '@/helpers/route-ops';
import { cloudflareInfoSchema } from '@repo/data-ops/zod-schema/links';
import { LinkClickMessageType } from '@repo/data-ops/zod-schema/queue';
import { Hono } from 'hono';

export const App = new Hono<{ Bindings: Env }>();

App.get('/:id', async (c) => {
	const id = c.req.param('id');

	const linkInfo = await getRoutingDestinations(c.env, id);
	if (!linkInfo) {
		return c.text("Destination not found", 404);
	}

	const cfHeaders = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if (!cfHeaders.success) {
		return c.text("Invalid Cloudflare headers", 500);
	}

	const headers = cfHeaders.data
	const destination = getDestinationForCountry(linkInfo, headers.country);

	const queueMessage: LinkClickMessageType = {
		type: "LINK_CLICK",
		data: {
			id: id,
			country: headers.country,
			destination: destination,
			accountId: linkInfo.accountId,
			latitude: headers.latitude,
			longitude: headers.longitude,
			timestamp: new Date().toISOString(),
		},
	}
	c.executionCtx.waitUntil(
		c.env.QUEUE.send(queueMessage)
	)

	return c.redirect(destination, 301);
});