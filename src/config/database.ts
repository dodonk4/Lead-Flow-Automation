import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const prisma = new PrismaClient();
export type DatabaseClient = PrismaClient | Prisma.TransactionClient;
