/*
  Warnings:

  - A unique constraint covering the columns `[domain]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `domain` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `School` ADD COLUMN `domain` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `School_domain_key` ON `School`(`domain`);
