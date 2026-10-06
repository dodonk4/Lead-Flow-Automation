import type { Lead, Prisma } from "@prisma/client";
import { findActiveAssignmentRuleByService } from "../repositories/assignment-rule.repository";
import { assignLeadToAdvisor } from "../repositories/lead.repository";

type AssignmentRuleWithAdvisor = Prisma.AssignmentRuleGetPayload<{
  include: { advisor: true };
}>;

type LeadForAssignment = Pick<Lead, "id" | "serviceRequested">;

type AssignmentDependencies = {
  findRule: (service: string) => Promise<AssignmentRuleWithAdvisor | null>;
  assignAdvisor: (leadId: string, advisorId: string) => Promise<Lead>;
};

const defaultDependencies: AssignmentDependencies = {
  findRule: findActiveAssignmentRuleByService,
  assignAdvisor: assignLeadToAdvisor,
};

export const createAssignmentService = (
  dependencies: AssignmentDependencies = defaultDependencies,
) => {
  return async (lead: LeadForAssignment): Promise<Lead | null> => {
    const rule = await dependencies.findRule(lead.serviceRequested);

    if (!rule) {
      return null;
    }

    return dependencies.assignAdvisor(lead.id, rule.advisorId);
  };
};

export const assignLead = createAssignmentService();
