import type { Lead, Prisma } from "@prisma/client";
import type { DatabaseClient } from "../config/database";
import type { CreateLeadInput } from "../schemas/lead.schema";

export type CreateLeadUseCase = (input: CreateLeadInput) => Promise<Lead>;

export type LeadCreationDependencies = {
  transaction: <T>(
    work: (tx: DatabaseClient) => Promise<T>,
  ) => Promise<T>;
  persistLead: (
    data: Prisma.LeadCreateInput,
    tx: DatabaseClient,
  ) => Promise<Lead>;
  assignLead: (
    lead: Lead,
    tx: DatabaseClient,
  ) => Promise<Lead | null>;
};
