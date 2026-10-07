import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import type { DatabaseClient } from "../config/database";
import type { CreateLeadInput } from "../schemas/lead.schema";
import { createLead as persistLead } from "../repositories/lead.repository";
import { assignLead } from "./assignment.service";
import type {
  CreateLeadUseCase,
  LeadCreationDependencies,
} from "./lead.service.types";

const defaultDependencies: LeadCreationDependencies = {
  transaction: (work) => prisma.$transaction((tx) => work(tx)),
  persistLead,
  assignLead,
};

export const createLeadService = (
  dependencies: LeadCreationDependencies = defaultDependencies,
): CreateLeadUseCase => async (input) => {
  const data: Prisma.LeadCreateInput = {
    companyName: input.companyName,
    contactName: input.contactName,
    email: input.email,
    serviceRequested: input.serviceRequested,
    details: input.details ?? null,
  };

  return dependencies.transaction(async (tx) => {
    const lead = await dependencies.persistLead(data, tx);
    const assignedLead = await dependencies.assignLead(lead, tx);

    return assignedLead ?? lead;
  });
};

export const createLead = createLeadService();
