-- CreateTable
CREATE TABLE `Topic` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Topic_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Definition` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `topic_id` INTEGER UNSIGNED NOT NULL,
    `definition` TEXT NOT NULL,
    `difficulty` TINYINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Word` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `definition_id` INTEGER UNSIGNED NOT NULL,
    `word` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Definition` ADD CONSTRAINT `Definition_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Word` ADD CONSTRAINT `Word_definition_id_fkey` FOREIGN KEY (`definition_id`) REFERENCES `Definition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
