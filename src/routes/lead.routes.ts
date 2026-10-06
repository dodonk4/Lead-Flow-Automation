import { Router } from "express";
import { createLeadController } from "../controllers/lead.controller";
import { createLead } from "../services/lead.service";
import type { CreateLeadUseCase } from "../services/lead.service";

export const createLeadRouter = (createLeadUseCase: CreateLeadUseCase = createLead) => {
  const router = Router();

  router.post("/api/leads", createLeadController(createLeadUseCase));

  return router;
};
