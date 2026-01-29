import { Hono } from 'hono';

export const App = new Hono<{Bindings: Env}>();

App.get("/hello-world", async (c) => {
	return c.json({
		message: "Hello world"
	})
});

/**
 * this is a dynamic id
 * c will give the contenxt for hono. It will give access to the env, request, response
 */
App.get("/:id", async (c) => {
	/**
	 * We need to use the headers on the req
	 * Hono will add some helper methods at this point
	 * It can provide the c.req.raw from the cloudflare request
	 */

	const regularHeaders = c.req.raw.headers;
	console.log(JSON.stringify(c.req.raw.headers))

	/**
	 * This has a lot of useful info that CF will provide. Check out cf.mock.jsonc for an actual example
	 */
	const cfHeaders = c.req.raw.cf;
	console.log(JSON.stringify(cfHeaders))
	return c.json({
		message: "updatem"
	})
});

