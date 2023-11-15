/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Expense` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_categoryId_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "categoryId";
