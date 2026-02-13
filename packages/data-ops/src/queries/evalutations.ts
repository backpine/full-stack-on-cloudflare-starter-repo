import { getDb } from "@/db/database";
import { destinationEvaluations } from "@/drizzle-out/schema";
import { and, desc, eq, gt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function addEvaluation(data: {
    linkId: string;
    accountId: string;
    destinationUrl: string;
    status: string;
    reason: string;
}) {
    const db = getDb();
    const id = uuidv4();
    await db.insert(destinationEvaluations).values({
        id: id,
        linkId: data.linkId,
        accountId: data.accountId,
        destinationUrl: data.destinationUrl,
        status: data.status,
        reason: data.reason,
    });
    return id;
}

export async function getNotAvailableEvaluations(accountId: string) {
    const db = getDb();
    const result = await db
        .select()
        .from(destinationEvaluations)
        .where(
            and(
                eq(destinationEvaluations.accountId, accountId),
                eq(destinationEvaluations.status, "NOT_AVAILABLE_PRODUCT"),
            ),
        )
        .orderBy(desc(destinationEvaluations.createdAt))
        .limit(20);

    return result;
}

export async function getEvaluations(
    accountId: string,
    createdBefore?: string,
) {
    const db = getDb();

    const conditions = [eq(destinationEvaluations.accountId, accountId)];

    if (createdBefore) {
        conditions.push(gt(destinationEvaluations.createdAt, createdBefore));
    }

    const result = await db
        .select()
        .from(destinationEvaluations)
        .where(and(...conditions))
        .orderBy(desc(destinationEvaluations.createdAt))
        .limit(25);

    return result;
}
