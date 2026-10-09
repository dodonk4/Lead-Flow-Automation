import type { RequestHandler } from "express";
import { env } from "../config/env";

export const corsMiddleware: RequestHandler = (request, response, next) => {
  const origin = request.get("origin");

  if (origin === env.frontendOrigin) {
    response.setHeader("Access-Control-Allow-Origin", env.frontendOrigin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }
  }

  next();
};
