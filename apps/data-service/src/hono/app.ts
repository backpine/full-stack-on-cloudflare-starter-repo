// import { getLink } from "@repo/data-ops/queries/links";
import { cloudflareInfoSchema } from "@repo/data-ops/zod-schema/links";
import { Data, Effect, Layer } from "effect";
import { Hono } from "hono";
import {
	getDestinationForCountry,
	getRoutingDestinations,
} from "@/helpers/route-ops";
import { CloudFlareContext } from "@/services";

class NoLinkInfo extends Data.TaggedError("NoLinkInfo") {}
class InvalidCloudflareHeaders extends Data.TaggedError(
	"InvalidCloudflareHeaders",
) {}

export const App = new Hono<{ Bindings: Env }>();

App.get("/:id", async (c) => {
	return Effect.runPromise(
		program.pipe(
			Effect.provide(Layer.succeed(CloudFlareContext, c)),
			Effect.match({
				onFailure: (error) => {
					switch (error._tag) {
						case "KvNotFoundError":
						case "KvFetchError":
						case "JsonParseError":
						case "ZodParseError":
						case "NoLinkFoundError":
						case "FetchLinkFromDBError":
						case "SaveLinktoKVError":
							return c.text(`Routing destination error: ${error._tag}`, 500);
						case "NoLinkInfo":
							return c.text("Destination not found", 404);
						case "InvalidCloudflareHeaders":
							return c.text("Invalid Cloudflare headers", 400);
						default: {
							// This will error if you don't handle all cases
							const _exhaustive: never = error;
							return _exhaustive;
						}
					}
				},
				onSuccess: (destination) => c.redirect(destination),
			}),
		),
	);

	// const id = c.req.param("id");

	// const linkInfo = await getRoutingDestinations(c.env, id);
	// if (!linkInfo) {
	// 	return c.text("Destination not found", 404);
	// }

	// const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	// if (!cfHeader.success) {
	// 	return c.text("Invalid Cloudflare headers", 400);
	// }

	// const headers = cfHeader.data;
	// const destination = getDestinationForCountry(linkInfo, headers.country);

	// return c.redirect(destination);
});

const program = Effect.gen(function* () {
	const c = yield* CloudFlareContext;
	const id = c.req.param("id");

	const linkInfo = yield* getRoutingDestinations(id);

	if (!linkInfo) {
		return yield* new NoLinkInfo();
	}

	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if (!cfHeader.success) {
		return yield* new InvalidCloudflareHeaders();
	}

	const headers = cfHeader.data;
	const destination = getDestinationForCountry(linkInfo, headers.country);

	// return c.redirect(destination);
	return destination;
});
