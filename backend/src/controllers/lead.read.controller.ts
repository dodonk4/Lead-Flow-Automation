import type { RequestHandler } from "express";
import { z } from "zod";
import type {
  GetLeadUseCase,
  ListLeadsUseCase,
} from "../services/lead.read.service.types";

const leadIdSchema = z.string().uuid();

export const listLeadsController = (
  listLeadsUseCase: ListLeadsUseCase,
): RequestHandler => async (_request, response, next) => {
  try {
    const leads = await listLeadsUseCase();
    response.status(200).json({ data: leads });
  } catch (error) {
    next(error);
  }
};

export const getLeadController = (
  getLeadUseCase: GetLeadUseCase,
): RequestHandler<{ id: string }> => async (request, response, next) => {
  const parsedId = leadIdSchema.safeParse(request.params.id);

  if (!parsedId.success) {
    response.status(400).json({ error: "Invalid lead ID" });
    return;
  }

  try {
    const lead = await getLeadUseCase(parsedId.data);

    if (!lead) {
      response.status(404).json({ error: "Lead not found" });
      return;
    }

    response.status(200).json({ data: lead });
  } catch (error) {
    next(error);
  }
};
