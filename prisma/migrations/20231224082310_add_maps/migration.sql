-- CreateTable
CREATE TABLE `Map` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER UNSIGNED NOT NULL,
    `img_url` TEXT NOT NULL,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Map` ADD CONSTRAINT `Map_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
