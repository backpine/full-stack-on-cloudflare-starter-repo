import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
	createLinkSchema,
	destinationsSchema,
} from "@repo/data-ops/zod-schema/links";
import { createLink } from "@repo/data-ops/queries/links";

import { TRPCError } from "@trpc/server";
import {
	ACTIVE_LINKS_LAST_HOUR,
	LAST_30_DAYS_BY_COUNTRY,
	LINK_LIST,
} from "./dummy-data";

export const linksTrpcRoutes = t.router({
	linkList: t.procedure
		.input(
			z.object({
				offset: z.number().optional(),
			}),
		)
		.query(async ({}) => {
			return LINK_LIST;
		}),
	createLink: t.procedure
		.input(createLinkSchema)
		.mutation(async ({ input, ctx }) => {
			const accountId = ctx.userInfo.userId;
			const linkId = await createLink({ accountId, ...input });
			// what happens if this errors out?
			return linkId;
		}),
	updateLinkName: t.procedure
		.input(
			z.object({
				linkId: z.string(),
				name: z.string().min(1).max(300),
			}),
		)
		.mutation(async ({ input }) => {
			console.log(input.linkId, input.name);
		}),
	getLink: t.procedure
		.input(
			z.object({
				linkId: z.string(),
			}),
		)
		.query(async ({}) => {
			const data = {
				name: "My Sample Link",
				linkId: "link_123456789",
				accountId: "user_987654321",
				destinations: {
					default: "https://example.com",
					mobile: "https://mobile.example.com",
					desktop: "https://desktop.example.com",
				},
				created: "2024-01-15T10:30:00Z",
				updated: "2024-01-20T14:45:00Z",
			};
			if (!data) throw new TRPCError({ code: "NOT_FOUND" });
			return data;
		}),
	updateLinkDestinations: t.procedure
		.input(
			z.object({
				linkId: z.string(),
				destinations: destinationsSchema,
			}),
		)
		.mutation(async ({ input }) => {
			console.log(input.linkId, input.destinations);
		}),
	activeLinks: t.procedure.query(async () => {
		return ACTIVE_LINKS_LAST_HOUR;
	}),
	totalLinkClickLastHour: t.procedure.query(async () => {
		return 13;
	}),
	last24HourClicks: t.procedure.query(async () => {
		return {
			last24Hours: 56,
			previous24Hours: 532,
			percentChange: 12,
		};
	}),
	last30DaysClicks: t.procedure.query(async () => {
		return 78;
	}),
	clicksByCountry: t.procedure.query(async () => {
		return LAST_30_DAYS_BY_COUNTRY;
	}),
});
