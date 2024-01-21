-- CreateTable
CREATE TABLE `Door` (
    `map_id` INTEGER UNSIGNED NOT NULL,
    `room1_id` INTEGER UNSIGNED NOT NULL,
    `room2_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`map_id`, `room1_id`, `room2_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Door` ADD CONSTRAINT `Door_map_id_fkey` FOREIGN KEY (`map_id`) REFERENCES `Map`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Door` ADD CONSTRAINT `Door_map_id_room1_id_fkey` FOREIGN KEY (`map_id`, `room1_id`) REFERENCES `Room`(`map_id`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Door` ADD CONSTRAINT `Door_map_id_room2_id_fkey` FOREIGN KEY (`map_id`, `room2_id`) REFERENCES `Room`(`map_id`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
