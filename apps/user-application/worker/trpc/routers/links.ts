import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  createLinkSchema,
  destinationsSchema,
} from "@repo/data-ops/zod-schema/links";
import {
  createLink,
  getLinks,
  getLink,
  updateLinkDestinations,
  updateLinkName,
  deleteLink,
} from "@repo/data-ops/queries/links";

import { TRPCError } from "@trpc/server";
import {
  ACTIVE_LINKS_LAST_HOUR,
  LAST_30_DAYS_BY_COUNTRY,
} from "./dummy-data";

export const linksTrpcRoutes = t.router({
  linkList: t.procedure
    .input(
      z.object({
        offset: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const links = await getLinks({
        accountId: ctx.userInfo.accountId,
        offset: input.offset,
        limit: 25,
      });

      // Transform to expected format
      return links.map((link) => ({
        linkId: link.linkId,
        name: link.name,
        destinations: link.destinations,
        created: link.createdAt.toISOString(),
      }));
    }),

  createLink: t.procedure.input(createLinkSchema).mutation(async ({ ctx, input }) => {
    const link = await createLink({
      accountId: ctx.userInfo.accountId,
      name: input.name,
      destinations: input.destinations,
    });

    return link.linkId;
  }),

  updateLinkName: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        name: z.string().min(1).max(300),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await updateLinkName({
        linkId: input.linkId,
        accountId: ctx.userInfo.accountId,
        name: input.name,
      });

      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      return { success: true };
    }),

  getLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const link = await getLink({
        linkId: input.linkId,
        accountId: ctx.userInfo.accountId,
      });

      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      return {
        name: link.name,
        linkId: link.linkId,
        accountId: link.accountId,
        destinations: link.destinations,
        created: link.createdAt.toISOString(),
        updated: link.updatedAt.toISOString(),
      };
    }),

  updateLinkDestinations: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        destinations: destinationsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await updateLinkDestinations({
        linkId: input.linkId,
        accountId: ctx.userInfo.accountId,
        destinations: input.destinations,
      });

      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      return { success: true };
    }),

  deleteLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const success = await deleteLink({
        linkId: input.linkId,
        accountId: ctx.userInfo.accountId,
      });

      if (!success) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      return { success: true };
    }),

  // Analytics endpoints (keeping dummy data for now)
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
