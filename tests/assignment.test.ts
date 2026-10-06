import assert from "node:assert/strict";
import type { Advisor, Lead, Prisma } from "@prisma/client";
import { test } from "node:test";
import { createAssignmentService } from "../src/services/assignment.service";

type AssignmentRuleWithAdvisor = Prisma.AssignmentRuleGetPayload<{
  include: { advisor: true };
}>;

const timestamp = new Date("2026-10-06T12:00:00.000Z");

function makeRule(service: string, advisorId: string, advisorName: string): AssignmentRuleWithAdvisor {
  const advisor: Advisor = {
    id: advisorId,
    name: advisorName,
    email: `${advisorName.toLowerCase()}@example.com`,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    id: `rule-${service}`,
    service,
    advisorId,
    advisor,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function makeLead(serviceRequested: string): Lead {
  return {
    id: "lead-1",
    companyName: "Example Company",
    contactName: "Alex Example",
    email: "alex@example.com",
    serviceRequested,
    details: null,
    assignedAdvisorId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

test("assigns leads to the advisor defined by each exact service rule", async () => {
  const rules = [
    makeRule("RRHH", "advisor-carlos", "Carlos"),
    makeRule("Legal", "advisor-maria", "María"),
    makeRule("Automatización", "advisor-ana", "Ana"),
  ];

  for (const rule of rules) {
    let assignedAdvisorId: string | undefined;
    const lead = makeLead(rule.service);
    const assignLead = createAssignmentService({
      findRule: async (service) =>
        rules.find((candidate) => candidate.service === service) ?? null,
      assignAdvisor: async (leadId, advisorId) => {
        assert.equal(leadId, lead.id);
        assignedAdvisorId = advisorId;
        return { ...lead, assignedAdvisorId: advisorId };
      },
    });

    const result = await assignLead(lead);

    assert.equal(assignedAdvisorId, rule.advisorId);
    assert.equal(result?.assignedAdvisorId, rule.advisorId);
  }
});

test("leaves the lead unassigned when no active rule matches", async () => {
  let leadWasUpdated = false;
  const assignLead = createAssignmentService({
    findRule: async () => null,
    assignAdvisor: async (leadId, advisorId) => {
      leadWasUpdated = true;
      return { ...makeLead("Unknown"), id: leadId, assignedAdvisorId: advisorId };
    },
  });

  const result = await assignLead(makeLead("Unknown"));

  assert.equal(result, null);
  assert.equal(leadWasUpdated, false);
});
