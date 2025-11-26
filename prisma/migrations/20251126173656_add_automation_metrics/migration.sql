-- CreateTable
CREATE TABLE "AutomationMetric" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "automationId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "commentsReplied" INTEGER NOT NULL DEFAULT 0,
    "dmsSent" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AutomationMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutomationMetric_automationId_date_key" ON "AutomationMetric"("automationId", "date");

-- AddForeignKey
ALTER TABLE "AutomationMetric" ADD CONSTRAINT "AutomationMetric_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
