-- DropIndex
DROP INDEX "File_originalName_key";

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "originalName" SET DATA TYPE VARCHAR(255);
