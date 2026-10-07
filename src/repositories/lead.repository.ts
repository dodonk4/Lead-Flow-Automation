import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import type { DatabaseClient } from "../config/database";

export const createLead = (
  data: Prisma.LeadCreateInput,
  tx: DatabaseClient = prisma,
) => tx.lead.create({ data });

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
