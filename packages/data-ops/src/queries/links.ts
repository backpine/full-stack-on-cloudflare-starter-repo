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
  
    const conditions = [eq(links.accountId, accountId)]; // Always filter by accountId
  
    if (createdBefore) {
      conditions.push(gt(links.created, createdBefore));
    } // Changed to 'gt' to get links created after the specified date
  
    const result = await db
      .select({
        linkId: links.linkId,
        destinations: links.destinations,
        created: links.created,
        name: links.name,
      }) // Changed to select specific fields
      .from(links)
      .where(and(...conditions)) // Spread conditions array
      .orderBy(desc(links.created))
      .limit(25); // Limit to 25 results
  
    return result.map((link) => ({
      ...link,
      lastSixHours: Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 100),
      ),
      linkClicks: 6,
      destinations: Object.keys(JSON.parse(link.destinations as string)).length,
    })); // Parse destinations to count them
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
  } //
  

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
  
  export async function activeLinksLastHour(accountId: string) {
    const db = getDb();
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
    const result = await db
      .select({
        name: links.name,
        linkId: links.linkId,
        clickCount: count(linkClicks.id).as("clickCount"),
        lastClicked: max(linkClicks.clickedTime),
      })
      .from(linkClicks)
      .innerJoin(links, eq(linkClicks.id, links.linkId)) // Join to get link names
      .where(
        and(
          gt(linkClicks.clickedTime, oneHourAgo.toISOString()),
          eq(linkClicks.accountId, accountId),
        ),
      )
      .groupBy(linkClicks.id)
      .orderBy(desc(sql`clickCount`))
      .limit(10);
  
    return result;
  }

  export async function totalLinkClickLastHour(
    accountId: string,
  ): Promise<number> {
    const db = getDb();
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
    const result = await db
      .select({
        count: count(),
      })
      .from(linkClicks)
      .where(
        and(
          gt(linkClicks.clickedTime, oneHourAgo.toISOString()),
          eq(linkClicks.accountId, accountId),
        ),
      );
  
    return result[0]?.count ?? 0;
  }

  export async function getLast24And48HourClicks(accountId: string) {
    const db = getDb();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  
    const result = await db
      .select({
        last24Hours: sql<number>`
          COUNT(CASE
            WHEN ${linkClicks.clickedTime} > ${twentyFourHoursAgo.toISOString()}
            THEN 1
          END)
        `,
        previous24Hours: sql<number>`
          COUNT(CASE
            WHEN ${linkClicks.clickedTime} <= ${twentyFourHoursAgo.toISOString()}
            AND ${linkClicks.clickedTime} > ${fortyEightHoursAgo.toISOString()}
            THEN 1
          END)
        `,
      })
      .from(linkClicks)
      .where(
        and(
          gt(linkClicks.clickedTime, fortyEightHoursAgo.toISOString()),
          eq(linkClicks.accountId, accountId),
        ),
      );
  
    const last24Hours = result[0]?.last24Hours ?? 0;
    const previous24Hours = result[0]?.previous24Hours ?? 0;
  
    let percentChange = 0;
    if (previous24Hours > 0) {
      percentChange = Math.round(
        ((last24Hours - previous24Hours) / previous24Hours) * 100,
      );
    } else if (last24Hours > 0) {
      percentChange = 100;
    }
  
    return {
      last24Hours,
      previous24Hours,
      percentChange,
    };
  }

  export async function getLast30DaysClicks(accountId: string) {
    const db = getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
    const result = await db
      .select({
        count: count(),
      })
      .from(linkClicks)
      .where(
        and(
          gt(linkClicks.clickedTime, thirtyDaysAgo.toISOString()),
          eq(linkClicks.accountId, accountId),
        ),
      );
  
    return result[0]?.count ?? 0;
  }

  export async function getLast30DaysClicksByCountry(accountId: string) {
    const db = getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
    const result = await db
      .select({
        country: linkClicks.country,
        count: count(linkClicks.id).as("count"),
      })
      .from(linkClicks)
      .where(
        and(
          gt(linkClicks.clickedTime, thirtyDaysAgo.toISOString()),
          eq(linkClicks.accountId, accountId),
        ),
      )
      .groupBy(linkClicks.country)
      .orderBy(desc(sql`count`));
  
    return result;
  }
  