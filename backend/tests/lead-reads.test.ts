import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import type { Express } from "express";
import { test } from "node:test";
import { createApp } from "../src/app";
import type { LeadWithAdvisor } from "../src/services/lead.read.service.types";

const lead: LeadWithAdvisor = {
  id: "08f61d67-e6d3-4ba4-a94e-f27caf1bb847",
  companyName: "Acme Inc.",
  contactName: "Alex Example",
  email: "alex@example.com",
  serviceRequested: "Automation",
  details: "Interested in automating lead intake.",
  assignedAdvisorId: "b3ac8eb2-b1a1-41d9-8d52-3ed4cd5f1f2a",
  assignedAdvisor: {
    id: "b3ac8eb2-b1a1-41d9-8d52-3ed4cd5f1f2a",
    name: "Ana Advisor",
    email: "ana@example.com",
  },
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

test("GET /api/leads returns leads with their assigned advisor", async (context) => {
  const server = await startServer(
    createApp({
      leadReads: {
        listLeads: async () => [lead],
        getLeadById: async () => lead,
      },
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    data: [
      {
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      },
    ],
  });
});

test("GET /api/leads/:id returns the requested lead", async (context) => {
  let requestedId: string | undefined;
  const server = await startServer(
    createApp({
      leadReads: {
        listLeads: async () => [],
        getLeadById: async (id) => {
          requestedId = id;
          return lead;
        },
      },
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads/${lead.id}`);
  const body = (await response.json()) as { data: { id: string } };

  assert.equal(response.status, 200);
  assert.equal(body.data.id, lead.id);
  assert.equal(requestedId, lead.id);
});

test("GET /api/leads/:id returns 404 when the lead does not exist", async (context) => {
  const server = await startServer(
    createApp({
      leadReads: {
        listLeads: async () => [],
        getLeadById: async () => null,
      },
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads/${lead.id}`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Lead not found" });
});

test("GET /api/leads/:id rejects malformed IDs", async (context) => {
  let called = false;
  const server = await startServer(
    createApp({
      leadReads: {
        listLeads: async () => [],
        getLeadById: async () => {
          called = true;
          return null;
        },
      },
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads/not-a-uuid`);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Invalid lead ID" });
  assert.equal(called, false);
});

test("lead read endpoints allow the configured frontend origin", async (context) => {
  const server = await startServer(
    createApp({
      leadReads: {
        listLeads: async () => [],
        getLeadById: async () => null,
      },
    }),
  );
  context.after(server.close);

  const response = await fetch(`${server.origin}/api/leads`, {
    headers: { origin: "http://localhost:5173" },
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "http://localhost:5173",
  );
});
