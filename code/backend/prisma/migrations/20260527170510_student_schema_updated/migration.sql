/*
  Warnings:

  - You are about to drop the column `isJobHolder` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "currentCompany" TEXT,
ADD COLUMN     "currentPosition" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isJobHolder";
