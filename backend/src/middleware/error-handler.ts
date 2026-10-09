import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";

const unavailablePrismaCodes = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (unavailablePrismaCodes.has(error.code)) {
      response.status(503).json({ error: "Persistence service unavailable" });
      return;
    }

    console.error("Prisma request failed:", error);
    response.status(500).json({ error: "Database operation failed" });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("Prisma initialization failed:", error);
    response.status(503).json({ error: "Persistence service unavailable" });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({ error: "Invalid JSON request body" });
    return;
  }

  console.error("Request failed:", error);
  response.status(500).json({ error: "Internal server error" });
};
