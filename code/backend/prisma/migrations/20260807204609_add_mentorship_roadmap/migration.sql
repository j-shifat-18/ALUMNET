/*
  Warnings:

  - A unique constraint covering the columns `[studentId,alumniId]` on the table `MentorshipRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "MentorshipSession" (
    "id" SERIAL NOT NULL,
    "mentorshipRequestId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipTask" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorshipSession_mentorshipRequestId_idx" ON "MentorshipSession"("mentorshipRequestId");

-- CreateIndex
CREATE INDEX "MentorshipTask_sessionId_idx" ON "MentorshipTask"("sessionId");

-- CreateIndex
CREATE INDEX "AlumniProfile_graduationYear_idx" ON "AlumniProfile"("graduationYear");

-- CreateIndex
CREATE UNIQUE INDEX "MentorshipRequest_studentId_alumniId_key" ON "MentorshipRequest"("studentId", "alumniId");

-- CreateIndex
CREATE INDEX "StudentProfile_program_idx" ON "StudentProfile"("program");

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorshipRequestId_fkey" FOREIGN KEY ("mentorshipRequestId") REFERENCES "MentorshipRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipTask" ADD CONSTRAINT "MentorshipTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MentorshipSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
