-- CreateTable
CREATE TABLE `ClaimedRoom` (
    `roomId` INTEGER UNSIGNED NOT NULL,
    `gameId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`roomId`, `gameId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClaimedRoom` ADD CONSTRAINT `ClaimedRoom_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClaimedRoom` ADD CONSTRAINT `ClaimedRoom_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
