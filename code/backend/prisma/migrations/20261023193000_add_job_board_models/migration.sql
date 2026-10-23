-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'RESEARCH', 'REFERRAL', 'CONTRACT');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'JOB_POSTED';
ALTER TYPE "NotificationType" ADD VALUE 'JOB_COMMENT';

-- AlterEnum
ALTER TYPE "WorkMode" ADD VALUE 'HYBRID';

-- CreateTable
CREATE TABLE "JobPost" (
    "id" SERIAL NOT NULL,
    "posterId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "workMode" "WorkMode" NOT NULL DEFAULT 'IN_PERSON',
    "jobType" "JobType" NOT NULL DEFAULT 'FULL_TIME',
    "department" TEXT,
    "skills" TEXT[],
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "salaryRange" TEXT,
    "applicationUrl" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobComment" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobPost_posterId_idx" ON "JobPost"("posterId");

-- CreateIndex
CREATE INDEX "JobPost_department_idx" ON "JobPost"("department");

-- CreateIndex
CREATE INDEX "JobPost_jobType_idx" ON "JobPost"("jobType");

-- CreateIndex
CREATE INDEX "JobPost_createdAt_idx" ON "JobPost"("createdAt");

-- CreateIndex
CREATE INDEX "JobComment_jobId_idx" ON "JobComment"("jobId");

-- CreateIndex
CREATE INDEX "JobComment_userId_idx" ON "JobComment"("userId");

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobComment" ADD CONSTRAINT "JobComment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobComment" ADD CONSTRAINT "JobComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
