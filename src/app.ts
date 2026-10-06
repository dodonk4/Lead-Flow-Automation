import express from "express";
import { healthRouter } from "./routes/health.routes";
import { createLeadRouter } from "./routes/lead.routes";
import { createLead } from "./services/lead.service";
import type { CreateLeadUseCase } from "./services/lead.service";
import { errorHandler } from "./middleware/error-handler";

export const createApp = (createLeadUseCase: CreateLeadUseCase = createLead) => {
  const app = express();

  app.use(express.json());
  app.use(healthRouter);
  app.use(createLeadRouter(createLeadUseCase));
  app.use(errorHandler);

  return app;
};

export const app = createApp();
