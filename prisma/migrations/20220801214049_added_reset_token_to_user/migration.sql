-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordToken" VARCHAR(255),
ADD COLUMN     "resetPasswordTokenExpiresAt" TIMESTAMP(3);
