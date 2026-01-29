import { Hono } from 'hono';
import {getLink} from "@repo/data-ops/queries/links";

export const App = new Hono<{Bindings: Env}>();

App.get("/hello-world", async (c) => {
	return c.json({
		message: "Hello world"
	})
});

App.get('/:id', async (c) => {
	const id = c.req.param('id');
	const linkInfoFromDb = await getLink(id)
	console.log(linkInfoFromDb)
	return c.json({...linkInfoFromDb})
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

