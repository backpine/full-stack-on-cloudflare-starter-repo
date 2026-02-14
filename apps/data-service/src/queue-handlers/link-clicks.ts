import {addLinkClick} from "@repo/data-ops/queries/links";
import {LinkClickMessageType} from "@repo/data-ops/zod-schema/queue";

/**
 * This eventually will work with queue, workflow, durable objects that can enable different things
 */
export async function handleLinkClick(env: Env, event: LinkClickMessageType) {
	await addLinkClick(event.data);

	const doId = env.EVALUATION_SCHEDULER.idFromName(`${event.data.id}:${event.data.destination}`)
	const stub = env.EVALUATION_SCHEDULER.get(doId);

	await stub.collectLinkClick(event.data.accountId, event.data.id, event.data.destination, event.data.country || "UNKNOWN");
}
