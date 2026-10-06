import { z } from "zod";

export const createLeadSchema = z
  .object({
    companyName: z.string().trim().min(1).max(160),
    contactName: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(320),
    serviceRequested: z.string().trim().min(1).max(100),
    details: z.string().trim().nullable().optional(),
  })
  .strict();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
