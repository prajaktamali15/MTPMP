/*
  Warnings:

  - You are about to drop the `OrganizationMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizationId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE "OrganizationMember";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
