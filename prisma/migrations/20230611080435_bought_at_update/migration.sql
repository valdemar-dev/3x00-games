/*
  Warnings:

  - The `boughtAt` column on the `Item` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "boughtAt",
ADD COLUMN     "boughtAt" INTEGER NOT NULL DEFAULT 1;
