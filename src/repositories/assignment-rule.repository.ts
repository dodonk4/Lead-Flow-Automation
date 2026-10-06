import { prisma } from "../config/database";

export const findActiveAssignmentRuleByService = (service: string) =>
  prisma.assignmentRule.findFirst({
    where: {
      service,
      isActive: true,
      advisor: { isActive: true },
    },
    include: { advisor: true },
  });
