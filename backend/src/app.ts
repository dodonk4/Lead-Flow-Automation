import express from "express";
import { healthRouter } from "./routes/health.routes";
import { createLeadRouter } from "./routes/lead.routes";
import { createLead } from "./services/lead.service";
import type { CreateLeadUseCase } from "./services/lead.service.types";
import { getLeadById, listLeads } from "./services/lead.read.service";
import type { LeadReadUseCases } from "./services/lead.read.service.types";
import { errorHandler } from "./middleware/error-handler";
import { corsMiddleware } from "./middleware/cors";

type AppDependencies = {
  createLead?: CreateLeadUseCase;
  leadReads?: LeadReadUseCases;
};

export const createApp = ({
  createLead: createLeadUseCase = createLead,
  leadReads = { listLeads, getLeadById },
}: AppDependencies = {}) => {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(healthRouter);
  app.use(createLeadRouter(createLeadUseCase, leadReads));
  app.use(errorHandler);

  return app;
};

export const app = createApp();
