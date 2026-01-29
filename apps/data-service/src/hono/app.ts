import { getLink } from "@repo/data-ops/queries/links";
import { cloudflareInfoSchema } from "@repo/data-ops/zod-schema/links";
import { Hono } from "hono";
import { ResultAsync } from "neverthrow";
import {
	getDestinationForCountry,
	getRoutingDestinations,
} from "@/helpers/route-ops";

export const App = new Hono<{ Bindings: Env }>();

App.get("/:id", async (c) => {
	const id = c.req.param("id");

	const linkInfo = await getRoutingDestinations(c.env, id);
	if (!linkInfo) {
		return c.text("Destination not found", 404);
	}

	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if (!cfHeader.success) {
		return c.text("Invalid Cloudflare headers", 400);
	}

	const headers = cfHeader.data;
	const destination = getDestinationForCountry(linkInfo, headers.country);

	return c.redirect(destination);

	// ###

	// const getLinkInfoFromDB = ResultAsync.fromThrowable(
	// 	() => getLink(id),
	// 	(error) => ({
	// 		type: "Error fetching link info from DB" as const,
	// 		details: JSON.stringify(error),
	// 	}),
	// );

	// const result = await getLinkInfoFromDB();
	// // 	.mapErr((error) => {
	// // 	switch (error.type) {
	// // 		case "Error fetching link info from DB":
	// // 			return c.text(error.details, 500);
	// // 		default: {
	// // 			const _exhaustive: never = error.type;
	// // 		}
	// // 	}
	// // });

	// if (result.isErr()) {
	// 	switch (result.error.type) {
	// 		case "Error fetching link info from DB":
	// 			return c.json({ error: result.error.details }, 500);
	// 		default: {
	// 			const _exhaustive: never = result.error.type;
	// 		}
	// 	}
	// } else {
	// 	if (result.value === null) {
	// 		return c.text("Link not found", 404);
	// 	}

	// 	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	// 	if (!cfHeader.success) {
	// 		return c.text("Invalid Cloudflare header", 400);
	// 	}

	// 	const headers = cfHeader.data;
	// 	const destination = getDestinationForCountry(result.value, headers.country);
	// 	return c.redirect(destination);
	// }

	// ###

	// const cf = c.req.raw.cf;
	// const country = cf?.country;
	// const lat = cf?.latitude;
	// const long = cf?.longitude;
	// return c.json({
	// 	country,
	// 	lat,
	// 	long,
	// });
});
