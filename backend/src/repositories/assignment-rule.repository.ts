import { prisma } from "../config/database";
import type { DatabaseClient } from "../config/database";

export const findActiveAssignmentRuleByService = (
  service: string,
  tx: DatabaseClient = prisma,
) =>
  tx.assignmentRule.findFirst({
    where: {
      service,
      isActive: true,
      advisor: { isActive: true },
    },
    include: { advisor: true },
  });
