import type { Lead, Prisma } from "@prisma/client";
import type { CreateLeadInput } from "../schemas/lead.schema";
import { createLead as persistLead } from "../repositories/lead.repository";

export type CreateLeadUseCase = (input: CreateLeadInput) => Promise<Lead>;

export const createLead: CreateLeadUseCase = (input) => {
  const data: Prisma.LeadCreateInput = {
    companyName: input.companyName,
    contactName: input.contactName,
    email: input.email,
    serviceRequested: input.serviceRequested,
    details: input.details ?? null,
  };

  return persistLead(data);
};
