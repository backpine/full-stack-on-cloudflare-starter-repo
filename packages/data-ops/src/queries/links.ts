import { and, desc, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/db/database";
import { links } from "@/drizzle-out/schema";
import {
	type CreateLinkSchemaType,
	type DestinationsSchemaType,
	destinationsSchema,
	linkSchema,
} from "@/zod/links";

export async function createLink(
	data: CreateLinkSchemaType & { accountId: string },
) {
	const db = getDb();
	const id = nanoid(10);
	await db.insert(links).values({
		linkId: id,
		accountId: data.accountId,
		name: data.name,
		destinations: JSON.stringify(data.destinations),
	});
	return id;
}

export async function getLinks(accountId: string, createdBefore?: string) {
	const db = getDb();

	const conditions = [eq(links.accountId, accountId)];

	if (createdBefore) {
		conditions.push(gt(links.created, createdBefore));
	}

	const result = await db
		.select({
			linkId: links.linkId,
			destinations: links.destinations,
			created: links.created,
			name: links.name,
		})
		.from(links)
		.where(and(...conditions))
		.orderBy(desc(links.created))
		.limit(25);

	return result.map((link) => ({
		...link,
		lastSixHours: Array.from({ length: 6 }, () =>
			Math.floor(Math.random() * 100),
		),
		linkClicks: 6,
		destinations: Object.keys(JSON.parse(link.destinations as string)).length,
	}));
}

export async function updateLinkName(linkId: string, name: string) {
	const db = getDb();
	await db
		.update(links)
		.set({
			name,
			updated: new Date().toISOString(),
		})
		.where(eq(links.linkId, linkId));
}

export async function getLink(linkId: string) {
	const db = getDb();

	const result = await db
		.select()
		.from(links)
		.where(eq(links.linkId, linkId))
		.limit(1);

	if (!result.length) {
		return null;
	}

	const link = result[0];
	const parsedLink = linkSchema.safeParse(link);
	if (!parsedLink.success) {
		console.log(parsedLink.error);
		throw new Error("BAD_REQUEST Error Parsing Link");
	}
	return parsedLink.data;
}

export async function updateLinkDestinations(
	linkId: string,
	destinations: DestinationsSchemaType,
) {
	const destinationsParsed = destinationsSchema.parse(destinations);
	const db = getDb();
	await db
		.update(links)
		.set({
			destinations: JSON.stringify(destinationsParsed),
			updated: new Date().toISOString(),
		})
		.where(eq(links.linkId, linkId));
}
