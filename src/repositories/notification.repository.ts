import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export const createNotification = (data: Prisma.NotificationCreateInput) =>
  prisma.notification.create({ data });
