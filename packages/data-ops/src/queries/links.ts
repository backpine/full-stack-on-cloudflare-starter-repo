import { getDb } from "@/db/database";
import {  linkClicks, links } from "@/drizzle-out/schema";
import { CreateLinkSchemaType, destinationsSchema, DestinationsSchemaType, linkSchema } from "@/zod/links";
import { LinkClickMessageType } from "@/zod/queue";
import { and, count, desc, eq, gt, max, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createLink(  data: CreateLinkSchemaType & { accountId: string },
){

    const db = getDb()
    const id = nanoid(10);
    await db.insert(links).values({
        linkId: id,
        accountId: data.accountId,
        name: data.name,
        destinations: JSON.stringify(data.destinations),
    })
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

  export async function addLinkClick(info: LinkClickMessageType["data"]) {
    const db = getDb();
    await db.insert(linkClicks).values({
      id: info.id,
      accountId: info.accountId,
      destination: info.destination,
      country: info.country,
      clickedTime: info.timestamp,
      latitude: info.latitude,
      longitude: info.longitude,
    });
  }