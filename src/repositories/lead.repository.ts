import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export const createLead = (data: Prisma.LeadCreateInput) =>
  prisma.lead.create({ data });

export const findLeadById = (id: string) =>
  prisma.lead.findUnique({ where: { id } });
