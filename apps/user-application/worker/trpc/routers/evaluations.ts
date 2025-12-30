import { t } from "@/worker/trpc/trpc-instance";

import { z } from "zod";
import {
  getEvaluations,
  getNotAvailableEvaluations,
} from "@repo/data-ops/queries/evaluations";

export const evaluationsTrpcRoutes = t.router({
  problematicDestinations: t.procedure.query(async ({}) => {
    return getNotAvailableEvaluations("testaccountid");
  }),
  recentEvaluations: t.procedure
    .input(
      z
        .object({
          createdBefore: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({}) => {
      const evaluations = await getEvaluations("testaccountid");

      const oldestCreatedAt =
        evaluations.length > 0  
          ? evaluations[evaluations.length - 1].createdAt
          : null;

      return {
        data: evaluations,
        oldestCreatedAt,
      };
    }),
});
