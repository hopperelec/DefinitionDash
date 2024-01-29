ALTER TABLE `Definition` DROP FOREIGN KEY `Definition_topic_id_fkey`;
ALTER TABLE `Door` DROP FOREIGN KEY `Door_map_id_fkey`,
    DROP FOREIGN KEY `Door_map_id_room1_id_fkey`,
    DROP FOREIGN KEY `Door_map_id_room2_id_fkey`;
ALTER TABLE `Map` DROP FOREIGN KEY `Map_creator_id_fkey`;
ALTER TABLE `Room` DROP FOREIGN KEY `Room_map_id_fkey`;
ALTER TABLE `Session` DROP FOREIGN KEY `Session_user_id_fkey`;
ALTER TABLE `User` DROP FOREIGN KEY `User_school_id_fkey`;

ALTER TABLE `Definition` CHANGE COLUMN `answer_regex` `answerRegex` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `topic_id` `topicId` INTEGER UNSIGNED NOT NULL;

ALTER TABLE `Door` CHANGE COLUMN `map_id` `mapId` INTEGER UNSIGNED NOT NULL,
    CHANGE COLUMN `room1_id` `room1Id` INTEGER UNSIGNED NOT NULL,
    CHANGE COLUMN `room2_id` `room2Id` INTEGER UNSIGNED NOT NULL;

ALTER TABLE `Map` CHANGE COLUMN `creator_id` `creatorId` INTEGER UNSIGNED NOT NULL,
    CHANGE COLUMN `img_url` `imgURL` TEXT NOT NULL;

ALTER TABLE `Room` CHANGE COLUMN `map_id` `mapId` INTEGER UNSIGNED NOT NULL;

ALTER TABLE `Session` CHANGE COLUMN `user_id` `userId` INTEGER UNSIGNED NOT NULL,
    CHANGE COLUMN `uuid_bin` `uuidBin` BINARY(16) NOT NULL;

ALTER TABLE `User` CHANGE COLUMN `google_sub` `googleSub` VARCHAR(255) NOT NULL,
    CHANGE COLUMN `is_teacher` `isTeacher` BOOLEAN NOT NULL DEFAULT false,
    CHANGE COLUMN `school_id` `schoolId` INTEGER UNSIGNED NOT NULL;

DROP INDEX `Session_uuid_bin_key` ON `Session`;
CREATE UNIQUE INDEX `Session_uuidBin_key` ON `Session`(`uuidBin`);
ALTER TABLE `User` ADD CONSTRAINT `User_schoolId_fkey` FOREIGN KEY (`schoolId`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Map` ADD CONSTRAINT `Map_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Room` ADD CONSTRAINT `Room_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Door` ADD CONSTRAINT `Door_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `Door_mapId_room1Id_fkey` FOREIGN KEY (`mapId`, `room1Id`) REFERENCES `Room`(`mapId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `Door_mapId_room2Id_fkey` FOREIGN KEY (`mapId`, `room2Id`) REFERENCES `Room`(`mapId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Definition` ADD CONSTRAINT `Definition_topicId_fkey` FOREIGN KEY (topicId) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;