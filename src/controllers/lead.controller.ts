import type { RequestHandler } from "express";
import { createLeadSchema } from "../schemas/lead.schema";
import { createLead } from "../services/lead.service";
import type { CreateLeadUseCase } from "../services/lead.service";

export const createLeadController = (
  createLeadUseCase: CreateLeadUseCase = createLead,
): RequestHandler => async (request, response, next) => {
  const parsed = createLeadSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      error: "Invalid lead data",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const lead = await createLeadUseCase(parsed.data);
    response.status(201).json({ data: lead });
  } catch (error) {
    next(error);
  }
};
