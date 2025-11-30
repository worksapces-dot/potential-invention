/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `ColdCallDeal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subdomain]` on the table `GeneratedWebsite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CREATOR', 'COLD_CALLER', 'BOTH');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'EMAIL_SENT', 'EMAIL_OPENED', 'EMAIL_REPLIED', 'CALL', 'MEETING', 'WEBSITE_GENERATED', 'WEBSITE_VIEWED', 'STATUS_CHANGE', 'DEAL_CREATED', 'DEAL_PAID', 'FOLLOW_UP_SCHEDULED');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('AI_GENERATION', 'EMAIL_SENDING', 'LEAD_ACQUISITION', 'MARKETING', 'OTHER');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('EMAIL', 'SMS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DealStatus" ADD VALUE 'ACTIVE_SUBSCRIPTION';
ALTER TYPE "DealStatus" ADD VALUE 'SUBSCRIPTION_CANCELLED';

-- AlterTable
ALTER TABLE "ColdCallDeal" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "recurringAmount" INTEGER,
ADD COLUMN     "recurringPlatformFee" INTEGER,
ADD COLUMN     "recurringSellerPayout" INTEGER,
ADD COLUMN     "refundAmount" INTEGER,
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeProductId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "ColdCallLead" ADD COLUMN     "lastContactedAt" TIMESTAMP(3),
ADD COLUMN     "leadScore" INTEGER,
ADD COLUMN     "nextFollowUp" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "GeneratedWebsite" ADD COLUMN     "subdomain" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userType" "UserType";

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColdCallAnalytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "leadsCreated" INTEGER NOT NULL DEFAULT 0,
    "leadsContacted" INTEGER NOT NULL DEFAULT 0,
    "leadsInterested" INTEGER NOT NULL DEFAULT 0,
    "leadsNegotiating" INTEGER NOT NULL DEFAULT 0,
    "leadsWon" INTEGER NOT NULL DEFAULT 0,
    "leadsLost" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "emailsClicked" INTEGER NOT NULL DEFAULT 0,
    "emailsReplied" INTEGER NOT NULL DEFAULT 0,
    "websitesGenerated" INTEGER NOT NULL DEFAULT 0,
    "websiteViews" INTEGER NOT NULL DEFAULT 0,
    "dealsCreated" INTEGER NOT NULL DEFAULT 0,
    "dealsPaid" INTEGER NOT NULL DEFAULT 0,
    "revenueGenerated" INTEGER NOT NULL DEFAULT 0,
    "platformFees" INTEGER NOT NULL DEFAULT 0,
    "netRevenue" INTEGER NOT NULL DEFAULT 0,
    "subscriptionsCreated" INTEGER NOT NULL DEFAULT 0,
    "recurringRevenue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColdCallAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadStatusHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fromStatus" "LeadStatus",
    "toStatus" "LeadStatus" NOT NULL,
    "timeInStatus" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColdCallCost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "CostType" NOT NULL,
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "leadId" UUID,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColdCallCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColdCallProposal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dealId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT[],
    "timeline" TEXT,
    "paymentTerms" TEXT,
    "revisions" INTEGER NOT NULL DEFAULT 2,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "clientSignature" TEXT,
    "signedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColdCallProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReminder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dealId" UUID NOT NULL,
    "type" "ReminderType" NOT NULL DEFAULT 'EMAIL',
    "message" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");

-- CreateIndex
CREATE INDEX "LeadActivity_createdAt_idx" ON "LeadActivity"("createdAt");

-- CreateIndex
CREATE INDEX "ColdCallAnalytics_userId_idx" ON "ColdCallAnalytics"("userId");

-- CreateIndex
CREATE INDEX "ColdCallAnalytics_date_idx" ON "ColdCallAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ColdCallAnalytics_userId_date_key" ON "ColdCallAnalytics"("userId", "date");

-- CreateIndex
CREATE INDEX "LeadStatusHistory_leadId_idx" ON "LeadStatusHistory"("leadId");

-- CreateIndex
CREATE INDEX "LeadStatusHistory_userId_idx" ON "LeadStatusHistory"("userId");

-- CreateIndex
CREATE INDEX "LeadStatusHistory_createdAt_idx" ON "LeadStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "ColdCallCost_userId_idx" ON "ColdCallCost"("userId");

-- CreateIndex
CREATE INDEX "ColdCallCost_date_idx" ON "ColdCallCost"("date");

-- CreateIndex
CREATE INDEX "ColdCallCost_type_idx" ON "ColdCallCost"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ColdCallProposal_dealId_key" ON "ColdCallProposal"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "ColdCallProposal_accessToken_key" ON "ColdCallProposal"("accessToken");

-- CreateIndex
CREATE INDEX "ColdCallProposal_status_idx" ON "ColdCallProposal"("status");

-- CreateIndex
CREATE INDEX "ColdCallProposal_accessToken_idx" ON "ColdCallProposal"("accessToken");

-- CreateIndex
CREATE INDEX "PaymentReminder_dealId_idx" ON "PaymentReminder"("dealId");

-- CreateIndex
CREATE INDEX "PaymentReminder_scheduledFor_idx" ON "PaymentReminder"("scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "ColdCallDeal_stripeSubscriptionId_key" ON "ColdCallDeal"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "ColdCallDeal_nextBillingDate_idx" ON "ColdCallDeal"("nextBillingDate");

-- CreateIndex
CREATE INDEX "ColdCallLead_nextFollowUp_idx" ON "ColdCallLead"("nextFollowUp");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedWebsite_subdomain_key" ON "GeneratedWebsite"("subdomain");

-- CreateIndex
CREATE INDEX "GeneratedWebsite_subdomain_idx" ON "GeneratedWebsite"("subdomain");

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ColdCallLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColdCallProposal" ADD CONSTRAINT "ColdCallProposal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "ColdCallDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "ColdCallDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
