import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import type { DatabaseClient } from "../config/database";

const assignedAdvisorInclude = {
  assignedAdvisor: {
    select: { id: true, name: true, email: true },
  },
} as const;

export const createLead = (
  data: Prisma.LeadCreateInput,
  tx: DatabaseClient = prisma,
) => tx.lead.create({ data });

export const listLeads = () =>
  prisma.lead.findMany({
    include: assignedAdvisorInclude,
    orderBy: { createdAt: "desc" },
  });

export const findLeadWithAdvisorById = (id: string) =>
  prisma.lead.findUnique({
    where: { id },
    include: assignedAdvisorInclude,
  });

export const findLeadById = (id: string) =>
  prisma.lead.findUnique({ where: { id } });

export const assignLeadToAdvisor = (
  leadId: string,
  advisorId: string,
  tx: DatabaseClient = prisma,
) =>
  tx.lead.update({
    where: { id: leadId },
    data: { assignedAdvisorId: advisorId },
    include: assignedAdvisorInclude,
  });
