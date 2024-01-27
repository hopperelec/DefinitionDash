/*
  Warnings:

  - You are about to drop the `Word` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `answer_regex` to the `Definition` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Word` DROP FOREIGN KEY `Word_definition_id_fkey`;

-- AlterTable
ALTER TABLE `Definition` ADD COLUMN `answer_regex` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Word`;
