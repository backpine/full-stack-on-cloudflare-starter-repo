import { getLink } from "@repo/data-ops/queries/links";
import {
	type LinkSchemaType,
	linkSchema,
} from "@repo/data-ops/zod-schema/links";

async function getLinkInfoFromKv(env: Env, id: string) {
	const linkInfo = await env.CACHE.get(id);
	if (!linkInfo) return null;
	try {
		const parsedLinkInfo = JSON.parse(linkInfo);
		return linkSchema.parse(parsedLinkInfo);
	} catch (error) {
		return null;
	}
}

const TTL_TIME = 60 * 60 * 24; // 1 day

async function saveLinkInfoToKv(
	env: Env,
	id: string,
	linkInfo: LinkSchemaType,
) {
	try {
		await env.CACHE.put(id, JSON.stringify(linkInfo), {
			expirationTtl: TTL_TIME,
		});
	} catch (error) {
		console.error("Error saving link info to KV:", error);
	}
}

export async function getRoutingDestinations(env: Env, id: string) {
	const linkInfo = await getLinkInfoFromKv(env, id);
	if (linkInfo) return linkInfo;
	const linkInfoFromDb = await getLink(id);
	if (!linkInfoFromDb) return null;
	await saveLinkInfoToKv(env, id, linkInfoFromDb);
	return linkInfoFromDb;
}

export function getDestinationForCountry(
	linkInfo: LinkSchemaType,
	countryCode?: string,
) {
	if (!countryCode) {
		return linkInfo.destinations.default;
	}

	// Check if the country code exists in destinations
	if (linkInfo.destinations[countryCode]) {
		return linkInfo.destinations[countryCode];
	}

	// Fallback to default
	return linkInfo.destinations.default;
}
