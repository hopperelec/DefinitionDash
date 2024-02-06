-- DropForeignKey
ALTER TABLE `Door` DROP FOREIGN KEY `Door_mapId_svgRef1Id_fkey`;

-- DropForeignKey
ALTER TABLE `Door` DROP FOREIGN KEY `Door_mapId_svgRef2Id_fkey`;

-- DropIndex
DROP INDEX `Door_mapId_svgRef1Id_svgRef2Id_key` ON `Door`;

-- AlterTable
ALTER TABLE `Door` CHANGE COLUMN `svgRef1Id` `svgRef1` INTEGER UNSIGNED NOT NULL,
    CHANGE COLUMN `svgRef2Id` `svgRef2` INTEGER UNSIGNED NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Door_mapId_svgRef1_svgRef2_key` ON `Door`(`mapId`, `svgRef1`, `svgRef2`);

-- AddForeignKey
ALTER TABLE `Door` ADD CONSTRAINT `Door_mapId_svgRef1_fkey` FOREIGN KEY (`mapId`, `svgRef1`) REFERENCES `Room`(`mapId`, `svgRef`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Door` ADD CONSTRAINT `Door_mapId_svgRef2_fkey` FOREIGN KEY (`mapId`, `svgRef2`) REFERENCES `Room`(`mapId`, `svgRef`) ON DELETE RESTRICT ON UPDATE CASCADE;
