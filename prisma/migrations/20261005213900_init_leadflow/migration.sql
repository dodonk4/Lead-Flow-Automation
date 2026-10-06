-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(160) NOT NULL,
    "contact_name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "service_requested" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "assigned_advisor_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_rules" (
    "id" UUID NOT NULL,
    "service" VARCHAR(100) NOT NULL,
    "advisor_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "advisor_id" UUID NOT NULL,
    "channel" VARCHAR(32) NOT NULL DEFAULT 'slack',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT NOT NULL,
    "external_id" VARCHAR(255),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_assigned_advisor_id_idx" ON "leads"("assigned_advisor_id");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "advisors_email_key" ON "advisors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_rules_service_key" ON "assignment_rules"("service");

-- CreateIndex
CREATE INDEX "assignment_rules_advisor_id_idx" ON "assignment_rules"("advisor_id");

-- CreateIndex
CREATE INDEX "notifications_lead_id_idx" ON "notifications"("lead_id");

-- CreateIndex
CREATE INDEX "notifications_advisor_id_idx" ON "notifications"("advisor_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_advisor_id_fkey" FOREIGN KEY ("assigned_advisor_id") REFERENCES "advisors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_rules" ADD CONSTRAINT "assignment_rules_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "advisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "advisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
