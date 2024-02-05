-- CreateTable
CREATE TABLE `ShopItem` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `cost` INTEGER UNSIGNED NOT NULL,
    `action` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ShopItem_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
