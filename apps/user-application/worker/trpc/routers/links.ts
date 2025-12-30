import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  createLinkSchema,
  destinationsSchema,
} from "@repo/data-ops/zod-schema/links";
import { createLink, getLinks, updateLinkName, updateLinkDestinations, getLink } from "@repo/data-ops/queries/links";
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
    .query(async ({ctx, input}) => {
      return await getLinks(ctx.userInfo.userId, input.offset?.toString());
    }),
  createLink: t.procedure.input(createLinkSchema).mutation(async ({input, ctx}) => {
    const linkId = await createLink({...input, accountId: ctx.userInfo.userId})
    return linkId
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
      await updateLinkName(input.linkId, input.name)
    }),
  getLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .query(async ({input}) => {
      const data = await getLink(input.linkId)
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
      await updateLinkDestinations(input.linkId, input.destinations)
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
