import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import type { DatabaseClient } from "../config/database";

export const createLead = (
  data: Prisma.LeadCreateInput,
  tx: DatabaseClient = prisma,
) => tx.lead.create({ data });

export const listLeads = () =>
  prisma.lead.findMany({
    include: {
      assignedAdvisor: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

export const findLeadWithAdvisorById = (id: string) =>
  prisma.lead.findUnique({
    where: { id },
    include: {
      assignedAdvisor: {
        select: { id: true, name: true, email: true },
      },
    },
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
  });
