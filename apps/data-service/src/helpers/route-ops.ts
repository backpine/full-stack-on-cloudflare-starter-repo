import { getLink } from "@repo/data-ops/queries/links";
import { linkSchema, LinkSchemaType } from "@repo/data-ops/zod-schema/links";

async function getLinkInfoFromKv(env: Env, id: string) {
	const linkInfo = await env.CACHE.get(id)
	if (!linkInfo) {
		console.log(`No link info found for id: ${id}`);
		return null;
	}
	console.log(`Link info found for id: ${id}`);
	try {
		const parsedLinkInfo = JSON.parse(linkInfo);
		return linkSchema.parse(parsedLinkInfo);
	} catch (error) {
		return null;
	}
}

const TTL_TIME_ONE_DAY = 60 * 60 * 24 // 1 day

async function saveLinkInfoToKv(env: Env, linkId: string, linkInfo: LinkSchemaType) {
	try {
		await env.CACHE.put(linkId, JSON.stringify(linkInfo),
			{
				// automatic cleanup at a later date
				expirationTtl: TTL_TIME_ONE_DAY
			}
		);
	} catch (error) {
		console.error('Error saving link info to KV:', error);
	}
}


export async function getRoutingDestinations(env: Env, linkId: string) {
	const linkInfo = await getLinkInfoFromKv(env, linkId);
	if (linkInfo) return linkInfo;
	const linkInfoFromDb = await getLink(linkId);
	if (!linkInfoFromDb) {
		return null;
	}
	await saveLinkInfoToKv(env, linkId, linkInfoFromDb);
	return linkInfoFromDb
}


export function getDestinationForCountry(linkInfo: LinkSchemaType, countryCode?: string) {
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
