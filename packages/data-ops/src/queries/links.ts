import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "../db/database";
import { linksTable, type Link } from "../db/schema";
import type { DestinationsSchemaType } from "../zod/links";

/**
 * Creates a new link in the database
 */
export async function createLink(params: {
  accountId: string;
  name: string;
  destinations: DestinationsSchemaType;
}): Promise<Link> {
  const db = getDb();
  const linkId = nanoid(10);

  const newLink = {
    linkId,
    accountId: params.accountId,
    name: params.name,
    destinations: params.destinations,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(linksTable).values(newLink);

  return newLink;
}

/**
 * Gets a list of links for an account
 * Returns up to 25 links, ordered by creation date descending
 */
export async function getLinks(params: {
  accountId: string;
  limit?: number;
  offset?: number;
}): Promise<Pick<Link, "linkId" | "destinations" | "createdAt" | "name">[]> {
  const db = getDb();

  const results = await db
    .select({
      linkId: linksTable.linkId,
      destinations: linksTable.destinations,
      createdAt: linksTable.createdAt,
      name: linksTable.name,
    })
    .from(linksTable)
    .where(eq(linksTable.accountId, params.accountId))
    .orderBy(desc(linksTable.createdAt))
    .limit(params.limit ?? 25)
    .offset(params.offset ?? 0);

  return results;
}

/**
 * Gets a single link by ID
 */
export async function getLink(params: {
  linkId: string;
  accountId?: string;
}): Promise<Link | null> {
  const db = getDb();

  const conditions = [eq(linksTable.linkId, params.linkId)];

  if (params.accountId) {
    conditions.push(eq(linksTable.accountId, params.accountId));
  }

  const results = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.linkId, params.linkId))
    .limit(1);

  return results[0] ?? null;
}

/**
 * Updates link destinations (supports Geo routing configuration)
 */
export async function updateLinkDestinations(params: {
  linkId: string;
  accountId: string;
  destinations: DestinationsSchemaType;
}): Promise<Link | null> {
  const db = getDb();

  await db
    .update(linksTable)
    .set({
      destinations: params.destinations,
      updatedAt: new Date(),
    })
    .where(eq(linksTable.linkId, params.linkId));

  return getLink({ linkId: params.linkId });
}

/**
 * Updates the link name
 */
export async function updateLinkName(params: {
  linkId: string;
  accountId: string;
  name: string;
}): Promise<Link | null> {
  const db = getDb();

  await db
    .update(linksTable)
    .set({
      name: params.name,
      updatedAt: new Date(),
    })
    .where(eq(linksTable.linkId, params.linkId));

  return getLink({ linkId: params.linkId });
}

/**
 * Deletes a link (hard delete)
 */
export async function deleteLink(params: {
  linkId: string;
  accountId: string;
}): Promise<boolean> {
  const db = getDb();

  const result = await db
    .delete(linksTable)
    .where(eq(linksTable.linkId, params.linkId))
    .returning();

  return result.length > 0;
}
