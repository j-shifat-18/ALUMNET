/*
  Warnings:

  - Added the required column `batch` to the `AlumniProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program` to the `AlumniProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlumniProfile" ADD COLUMN     "batch" TEXT NOT NULL,
ADD COLUMN     "personalWebsite" TEXT,
ADD COLUMN     "program" TEXT NOT NULL,
ADD COLUMN     "resumeUrl" TEXT,
ALTER COLUMN "currentCompany" DROP NOT NULL,
ALTER COLUMN "currentPosition" DROP NOT NULL,
ALTER COLUMN "industry" DROP NOT NULL,
ALTER COLUMN "experienceYears" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactNo" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "isJobHolder" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "updatedAt" DROP DEFAULT;
