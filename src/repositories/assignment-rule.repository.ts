import { prisma } from "../config/database";

export const findActiveAssignmentRuleByService = (service: string) =>
  prisma.assignmentRule.findUnique({
    where: { service, isActive: true },
    include: { advisor: true },
  });
