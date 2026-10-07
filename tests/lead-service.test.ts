import assert from "node:assert/strict";
import type { Lead } from "@prisma/client";
import { test } from "node:test";
import type { CreateLeadInput } from "../src/schemas/lead.schema";
import { createLeadService } from "../src/services/lead.service";
import type { DatabaseClient } from "../src/config/database";

const input: CreateLeadInput = {
  companyName: "Acme Inc.",
  contactName: "Alex Example",
  email: "alex@example.com",
  serviceRequested: "Automation",
  details: null,
};

const timestamp = new Date("2026-10-07T12:00:00.000Z");
const createdLead: Lead = {
  id: "lead-1",
  companyName: input.companyName,
  contactName: input.contactName,
  email: input.email,
  serviceRequested: input.serviceRequested,
  details: input.details,
  assignedAdvisorId: null,
  createdAt: timestamp,
  updatedAt: timestamp,
};

test("creates, assigns, and returns the lead inside one transaction", async () => {
  const calls: string[] = [];
  const tx = {} as DatabaseClient;
  const assignedLead = { ...createdLead, assignedAdvisorId: "advisor-1" };
  const createLead = createLeadService({
    transaction: async (work) => {
      calls.push("transaction:start");
      try {
        const result = await work(tx);
        calls.push("transaction:commit");
        return result;
      } catch (error) {
        calls.push("transaction:rollback");
        throw error;
      }
    },
    persistLead: async (data, transactionTx) => {
      assert.equal(transactionTx, tx);
      calls.push("lead:create");
      assert.equal(data.serviceRequested, input.serviceRequested);
      return createdLead;
    },
    assignLead: async (lead, transactionTx) => {
      assert.equal(transactionTx, tx);
      assert.equal(lead.id, createdLead.id);
      calls.push("lead:assign");
      return assignedLead;
    },
  });

  const result = await createLead(input);

  assert.deepEqual(calls, [
    "transaction:start",
    "lead:create",
    "lead:assign",
    "transaction:commit",
  ]);
  assert.equal(result.assignedAdvisorId, "advisor-1");
});

test("commits and returns an unassigned lead when no rule applies", async () => {
  let transactionCommitted = false;
  const createLead = createLeadService({
    transaction: async (work) => {
      const result = await work({} as DatabaseClient);
      transactionCommitted = true;
      return result;
    },
    persistLead: async () => createdLead,
    assignLead: async () => null,
  });

  const result = await createLead(input);

  assert.equal(transactionCommitted, true);
  assert.equal(result, createdLead);
  assert.equal(result.assignedAdvisorId, null);
});

test("propagates assignment errors so the transaction can roll back lead creation", async () => {
  const assignmentFailure = new Error("Assignment lookup failed");
  let transactionRolledBack = false;
  const createLead = createLeadService({
    transaction: async (work) => {
      try {
        return await work({} as DatabaseClient);
      } catch (error) {
        transactionRolledBack = true;
        throw error;
      }
    },
    persistLead: async () => createdLead,
    assignLead: async () => {
      throw assignmentFailure;
    },
  });

  await assert.rejects(createLead(input), assignmentFailure);
  assert.equal(transactionRolledBack, true);
});
