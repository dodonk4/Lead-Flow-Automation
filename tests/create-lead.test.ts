import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { Prisma, type Lead } from "@prisma/client";
import type { Express } from "express";
import { test } from "node:test";
import { createApp } from "../src/app";
import type { CreateLeadInput } from "../src/schemas/lead.schema";

const input: CreateLeadInput = {
  companyName: "Acme Inc.",
  contactName: "Alex Example",
  email: "alex@example.com",
  serviceRequested: "Automation",
  details: "Interested in automating lead intake.",
};

const createdLead: Lead = {
  id: "08f61d67-e6d3-4ba4-a94e-f27caf1bb847",
  companyName: input.companyName,
  contactName: input.contactName,
  email: input.email,
  serviceRequested: input.serviceRequested,
  details: input.details ?? null,
  assignedAdvisorId: null,
  createdAt: new Date("2026-10-05T12:00:00.000Z"),
  updatedAt: new Date("2026-10-05T12:00:00.000Z"),
};

async function startServer(app: Express) {
  const server: Server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  assert.ok(address && typeof address !== "string");

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

test("POST /api/leads creates a lead and returns 201", async (context) => {
  let receivedInput: CreateLeadInput | undefined;
  const server = await startServer(
    createApp(async (leadInput) => {
      receivedInput = leadInput;
      return createdLead;
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, companyName: "  Acme Inc.  " }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    data: {
      ...createdLead,
      createdAt: createdLead.createdAt.toISOString(),
      updatedAt: createdLead.updatedAt.toISOString(),
    },
  });
  assert.equal(receivedInput?.companyName, "Acme Inc.");
});

test("POST /api/leads rejects invalid input without calling the use case", async (context) => {
  let useCaseCalled = false;
  const server = await startServer(
    createApp(async () => {
      useCaseCalled = true;
      return createdLead;
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, email: "not-an-email" }),
  });
  const body = (await response.json()) as { error: string; details: { email: string[] } };

  assert.equal(response.status, 400);
  assert.equal(body.error, "Invalid lead data");
  assert.ok(body.details.email.length > 0);
  assert.equal(useCaseCalled, false);
});

test("POST /api/leads returns 503 when PostgreSQL is unavailable", async (context) => {
  const persistenceError = new Prisma.PrismaClientKnownRequestError(
    "Can't reach database server",
    { code: "P1001", clientVersion: "6.12.0" },
  );
  const server = await startServer(
    createApp(async () => {
      throw persistenceError;
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "Persistence service unavailable",
  });
});
