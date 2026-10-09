import { Router } from "express";
import { createLeadController } from "../controllers/lead.controller";
import {
  getLeadController,
  listLeadsController,
} from "../controllers/lead.read.controller";
import { createLead } from "../services/lead.service";
import type { CreateLeadUseCase } from "../services/lead.service.types";
import { getLeadById, listLeads } from "../services/lead.read.service";
import type { LeadReadUseCases } from "../services/lead.read.service.types";

export const createLeadRouter = (
  createLeadUseCase: CreateLeadUseCase = createLead,
  leadReadUseCases: LeadReadUseCases = { listLeads, getLeadById },
) => {
  const router = Router();

  router.get("/api/leads", listLeadsController(leadReadUseCases.listLeads));
  router.get(
    "/api/leads/:id",
    getLeadController(leadReadUseCases.getLeadById),
  );
  router.post("/api/leads", createLeadController(createLeadUseCase));

  return router;
};
