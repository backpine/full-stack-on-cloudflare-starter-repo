import {addLinkClick} from "@repo/data-ops/queries/links";
import {LinkClickMessageType} from "@repo/data-ops/zod-schema/queue";

/**
 * This eventually will work with queue, workflow, durable objects that can enable different things
 */
export async function handleLinkClick(env: Env, event: LinkClickMessageType) {
	await addLinkClick(event.data);
}
