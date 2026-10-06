import { prisma } from "../config/database";

export const findAdvisorById = (id: string) =>
  prisma.advisor.findUnique({ where: { id } });
