import { Hono } from 'hono';

export const App = new Hono<{Bindings: Env}>();

/**
 * this is a dynamic id
 * c will give the contenxt for hono. It will give access to the env, request, response
 */
App.get("/:id", async (c) => {
	return c.json({
		message: "Hello world"
	})
});
