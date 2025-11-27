-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('AUTOMATION', 'INTEGRATIONS', 'UI_UX', 'ANALYTICS', 'MARKETPLACE', 'MOBILE_APP', 'API', 'SECURITY', 'PERFORMANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "FeatureStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeaturePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "userId" UUID NOT NULL,
    "status" "FeatureStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "FeaturePriority" NOT NULL DEFAULT 'LOW',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "adminResponse" TEXT,
    "adminUserId" UUID,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureVote" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureComment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureRequest_status_idx" ON "FeatureRequest"("status");

-- CreateIndex
CREATE INDEX "FeatureRequest_category_idx" ON "FeatureRequest"("category");

-- CreateIndex
CREATE INDEX "FeatureRequest_score_idx" ON "FeatureRequest"("score");

-- CreateIndex
CREATE INDEX "FeatureRequest_createdAt_idx" ON "FeatureRequest"("createdAt");

-- CreateIndex
CREATE INDEX "FeatureVote_featureId_idx" ON "FeatureVote"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureVote_userId_featureId_key" ON "FeatureVote"("userId", "featureId");

-- CreateIndex
CREATE INDEX "FeatureComment_featureId_idx" ON "FeatureComment"("featureId");

-- CreateIndex
CREATE INDEX "FeatureComment_parentId_idx" ON "FeatureComment"("parentId");

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureComment" ADD CONSTRAINT "FeatureComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureComment" ADD CONSTRAINT "FeatureComment_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureComment" ADD CONSTRAINT "FeatureComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FeatureComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
