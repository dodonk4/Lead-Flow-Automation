import type { Lead, Prisma } from "@prisma/client";
import type { DatabaseClient } from "../config/database";

export type AssignmentRuleWithAdvisor = Prisma.AssignmentRuleGetPayload<{
  include: { advisor: true };
}>;

export type LeadForAssignment = Pick<Lead, "id" | "serviceRequested">;

export type AssignmentDependencies = {
  findRule: (
    service: string,
    tx?: DatabaseClient,
  ) => Promise<AssignmentRuleWithAdvisor | null>;
  assignAdvisor: (
    leadId: string,
    advisorId: string,
    tx?: DatabaseClient,
  ) => Promise<Lead>;
};

export type AssignmentService = (
  lead: LeadForAssignment,
  tx?: DatabaseClient,
) => Promise<Lead | null>;
