import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoAdvisors = [
  {
    name: "Carlos Gómez",
    email: "carlos.gomez@example.com",
    service: "RRHH",
  },
  {
    name: "María López",
    email: "maria.lopez@example.com",
    service: "Legal",
  },
  {
    name: "Ana Torres",
    email: "ana.torres@example.com",
    service: "Automatización",
  },
] as const;

async function seedDemoData() {
  for (const { name, email, service } of demoAdvisors) {
    const advisor = await prisma.advisor.upsert({
      where: { email },
      create: { name, email, isActive: true },
      update: {},
    });

    await prisma.assignmentRule.upsert({
      where: { service },
      create: {
        service,
        advisorId: advisor.id,
        isActive: true,
      },
      update: {},
    });
  }
}

seedDemoData()
  .catch((error: unknown) => {
    console.error("Could not seed LeadFlow demo data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
