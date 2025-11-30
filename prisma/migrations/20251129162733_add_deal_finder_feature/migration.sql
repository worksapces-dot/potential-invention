/*
  Warnings:

  - A unique constraint covering the columns `[stripeConnectId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PromotionTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OutreachCampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SearchMode" AS ENUM ('PROBLEM_POSTS', 'COMPETITOR_FOLLOWERS', 'HASHTAG_MINING', 'LOCATION_BASED', 'WEBSITE_SCRAPING', 'MANUAL_UPLOAD');

-- CreateEnum
CREATE TYPE "PitchStyle" AS ENUM ('PROBLEM_SOLVER', 'SOCIAL_PROOF', 'VALUE_FIRST', 'CURIOSITY', 'DIRECT_OFFER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('FOUND', 'QUEUED', 'DM_SENT', 'OPENED', 'REPLIED', 'INTERESTED', 'NEGOTIATING', 'DEAL_CLOSED', 'NOT_INTERESTED', 'GHOSTED', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('USER', 'PROSPECT', 'SYSTEM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeConnectEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeConnectId" TEXT,
ADD COLUMN     "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Promotion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "tier" "PromotionTier" NOT NULL,
    "boostViews" INTEGER NOT NULL,
    "viewsDelivered" INTEGER NOT NULL DEFAULT 0,
    "amount" INTEGER NOT NULL,
    "stripePaymentId" TEXT,
    "status" "PromotionStatus" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColdCallLead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "businessName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "googleMapsUrl" TEXT,
    "yelpUrl" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "userId" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColdCallLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedWebsite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "template" TEXT NOT NULL,
    "previewUrl" TEXT,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedWebsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachEmail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMP(3),
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColdCallDeal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "sellerPayout" INTEGER NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentId" TEXT,
    "status" "DealStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColdCallDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealFinderProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "businessType" TEXT,
    "services" TEXT[],
    "targetAudience" TEXT,
    "tone" TEXT,
    "priceRange" TEXT,
    "portfolio" TEXT,
    "analyzedPosts" INTEGER NOT NULL DEFAULT 0,
    "analyzedReels" INTEGER NOT NULL DEFAULT 0,
    "lastAnalyzedAt" TIMESTAMP(3),
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealFinderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachCampaign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profileId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OutreachCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "searchMode" "SearchMode" NOT NULL,
    "keywords" TEXT[],
    "targetFollowers" TEXT,
    "location" TEXT,
    "hashtags" TEXT[],
    "pitchStyle" "PitchStyle" NOT NULL,
    "pitchTemplate" TEXT,
    "dailyLimit" INTEGER NOT NULL DEFAULT 50,
    "totalLimit" INTEGER,
    "currentDayCount" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalOpened" INTEGER NOT NULL DEFAULT 0,
    "totalReplied" INTEGER NOT NULL DEFAULT 0,
    "totalInterested" INTEGER NOT NULL DEFAULT 0,
    "dealsWon" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaignId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT,
    "followers" INTEGER,
    "following" INTEGER,
    "postsCount" INTEGER,
    "engagementRate" DOUBLE PRECISION,
    "bio" TEXT,
    "email" TEXT,
    "website" TEXT,
    "profilePicUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBusinessAccount" BOOLEAN NOT NULL DEFAULT false,
    "foundVia" TEXT NOT NULL,
    "sourcePost" TEXT,
    "sourcePostCaption" TEXT,
    "painPoint" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "status" "ProspectStatus" NOT NULL DEFAULT 'FOUND',
    "pitchSent" TEXT,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "lastFollowUpAt" TIMESTAMP(3),
    "followUpCount" INTEGER NOT NULL DEFAULT 0,
    "interested" BOOLEAN NOT NULL DEFAULT false,
    "dealClosed" BOOLEAN NOT NULL DEFAULT false,
    "dealAmount" INTEGER,
    "dealClosedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prospectId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProspectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_stripePaymentId_key" ON "Promotion"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Promotion_productId_idx" ON "Promotion"("productId");

-- CreateIndex
CREATE INDEX "Promotion_status_idx" ON "Promotion"("status");

-- CreateIndex
CREATE INDEX "Promotion_endsAt_idx" ON "Promotion"("endsAt");

-- CreateIndex
CREATE INDEX "ColdCallLead_userId_idx" ON "ColdCallLead"("userId");

-- CreateIndex
CREATE INDEX "ColdCallLead_status_idx" ON "ColdCallLead"("status");

-- CreateIndex
CREATE INDEX "ColdCallLead_category_idx" ON "ColdCallLead"("category");

-- CreateIndex
CREATE INDEX "ColdCallLead_city_idx" ON "ColdCallLead"("city");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedWebsite_leadId_key" ON "GeneratedWebsite"("leadId");

-- CreateIndex
CREATE INDEX "OutreachEmail_leadId_idx" ON "OutreachEmail"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "ColdCallDeal_leadId_key" ON "ColdCallDeal"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "ColdCallDeal_stripeInvoiceId_key" ON "ColdCallDeal"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ColdCallDeal_stripePaymentId_key" ON "ColdCallDeal"("stripePaymentId");

-- CreateIndex
CREATE INDEX "ColdCallDeal_status_idx" ON "ColdCallDeal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DealFinderProfile_userId_key" ON "DealFinderProfile"("userId");

-- CreateIndex
CREATE INDEX "DealFinderProfile_userId_idx" ON "DealFinderProfile"("userId");

-- CreateIndex
CREATE INDEX "OutreachCampaign_profileId_idx" ON "OutreachCampaign"("profileId");

-- CreateIndex
CREATE INDEX "OutreachCampaign_status_idx" ON "OutreachCampaign"("status");

-- CreateIndex
CREATE INDEX "Prospect_campaignId_idx" ON "Prospect"("campaignId");

-- CreateIndex
CREATE INDEX "Prospect_status_idx" ON "Prospect"("status");

-- CreateIndex
CREATE INDEX "Prospect_username_idx" ON "Prospect"("username");

-- CreateIndex
CREATE INDEX "ProspectMessage_prospectId_idx" ON "ProspectMessage"("prospectId");

-- CreateIndex
CREATE INDEX "ProspectMessage_sentAt_idx" ON "ProspectMessage"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeConnectId_key" ON "User"("stripeConnectId");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWebsite" ADD CONSTRAINT "GeneratedWebsite_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ColdCallLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachEmail" ADD CONSTRAINT "OutreachEmail_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ColdCallLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColdCallDeal" ADD CONSTRAINT "ColdCallDeal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ColdCallLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealFinderProfile" ADD CONSTRAINT "DealFinderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachCampaign" ADD CONSTRAINT "OutreachCampaign_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DealFinderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectMessage" ADD CONSTRAINT "ProspectMessage_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
