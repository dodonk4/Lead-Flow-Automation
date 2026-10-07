import { prisma } from "../config/database";
import type { DatabaseClient } from "../config/database";
import { findActiveAssignmentRuleByService } from "../repositories/assignment-rule.repository";
import { assignLeadToAdvisor } from "../repositories/lead.repository";
import type {
  AssignmentDependencies,
  AssignmentService,
  LeadForAssignment,
} from "./assignment.service.types";

const defaultDependencies: AssignmentDependencies = {
  findRule: findActiveAssignmentRuleByService,
  assignAdvisor: assignLeadToAdvisor,
};

export const createAssignmentService = (
  dependencies: AssignmentDependencies = defaultDependencies,
): AssignmentService => {
  return async (
    lead: LeadForAssignment,
    tx?: DatabaseClient,
  ) => {
    const client = tx ?? prisma;
    const rule = await dependencies.findRule(lead.serviceRequested, client);

    if (!rule) {
      return null;
    }

    return dependencies.assignAdvisor(lead.id, rule.advisorId, client);
  };
};

export const assignLead = createAssignmentService();
