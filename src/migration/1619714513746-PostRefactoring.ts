import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRefactoring1619714513746 implements MigrationInterface {
    name = 'PostRefactoring1619714513746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `location` (`id` int NOT NULL AUTO_INCREMENT, `location` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `tag` (`id` int NOT NULL AUTO_INCREMENT, `tagName` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `image` (`id` int NOT NULL AUTO_INCREMENT, `uri` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content_card` (`id` varchar(36) NOT NULL, `description` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `imageId` int NULL, `contentId` varchar(36) NULL, UNIQUE INDEX `REL_d9613d6e3cdcbb672c75ee1a66` (`imageId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `imagecard` (`id` varchar(36) NOT NULL, `description` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userId` varchar(36) NULL, `imageId` int NULL, `locationId` int NULL, UNIQUE INDEX `REL_25505b3c411138e04bf63123a6` (`imageId`), UNIQUE INDEX `REL_1688ec3dd5b4545173a167b8ba` (`locationId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` varchar(36) NOT NULL, `userName` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `imgUrl` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content` (`id` varchar(36) NOT NULL, `title` varchar(255) NOT NULL, `description` varchar(500) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userId` varchar(36) NULL, `imageId` int NULL, UNIQUE INDEX `REL_cd03caa6e34f3c76d9f1039353` (`imageId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `location_content_content` (`locationId` int NOT NULL, `contentId` varchar(36) NOT NULL, INDEX `IDX_95e2e085b4e8e9fcc79c9d2560` (`locationId`), INDEX `IDX_63a46750c61fca800be5c48f95` (`contentId`), PRIMARY KEY (`locationId`, `contentId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `tag_location_location` (`tagId` int NOT NULL, `locationId` int NOT NULL, INDEX `IDX_2f6f4113049bc9140158bb1a0c` (`tagId`), INDEX `IDX_080989334025b8fc6e4bf3a2fc` (`locationId`), PRIMARY KEY (`tagId`, `locationId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `follow` (`follower` varchar(36) NOT NULL, `following` varchar(36) NOT NULL, INDEX `IDX_903c67798aca5869c297418838` (`follower`), INDEX `IDX_847c7b957f75e9f3e3f8d3d304` (`following`), PRIMARY KEY (`follower`, `following`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `favourite` (`user` varchar(36) NOT NULL, `content` varchar(36) NOT NULL, INDEX `IDX_44f54717036fa2329ea124dd10` (`user`), INDEX `IDX_0dc9e57dc307764721a80e274b` (`content`), PRIMARY KEY (`user`, `content`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `bookmark` (`user` varchar(36) NOT NULL, `content` varchar(36) NOT NULL, INDEX `IDX_f510ea7de6cd9737a8abfc76f3` (`user`), INDEX `IDX_fe0a594fdef26d81b2831bbd16` (`content`), PRIMARY KEY (`user`, `content`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content_tag_tag` (`contentId` varchar(36) NOT NULL, `tagId` int NOT NULL, INDEX `IDX_02dff9435c8ec4dcfbf5217b50` (`contentId`), INDEX `IDX_5257b52b6d5641add91de83e94` (`tagId`), PRIMARY KEY (`contentId`, `tagId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `content_card` ADD CONSTRAINT `FK_d9613d6e3cdcbb672c75ee1a66d` FOREIGN KEY (`imageId`) REFERENCES `image`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_card` ADD CONSTRAINT `FK_f08ce43aafa2e30719736c066be` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_3d537956c7ea11bb8ee239e24f2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_25505b3c411138e04bf63123a65` FOREIGN KEY (`imageId`) REFERENCES `image`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_1688ec3dd5b4545173a167b8ba3` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content` ADD CONSTRAINT `FK_43185da5e33e99752c6edf91352` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content` ADD CONSTRAINT `FK_cd03caa6e34f3c76d9f1039353c` FOREIGN KEY (`imageId`) REFERENCES `image`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `location_content_content` ADD CONSTRAINT `FK_95e2e085b4e8e9fcc79c9d2560b` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `location_content_content` ADD CONSTRAINT `FK_63a46750c61fca800be5c48f95c` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tag_location_location` ADD CONSTRAINT `FK_2f6f4113049bc9140158bb1a0cf` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tag_location_location` ADD CONSTRAINT `FK_080989334025b8fc6e4bf3a2fc8` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `follow` ADD CONSTRAINT `FK_903c67798aca5869c297418838b` FOREIGN KEY (`follower`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `follow` ADD CONSTRAINT `FK_847c7b957f75e9f3e3f8d3d3047` FOREIGN KEY (`following`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `favourite` ADD CONSTRAINT `FK_44f54717036fa2329ea124dd109` FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `favourite` ADD CONSTRAINT `FK_0dc9e57dc307764721a80e274b2` FOREIGN KEY (`content`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookmark` ADD CONSTRAINT `FK_f510ea7de6cd9737a8abfc76f3b` FOREIGN KEY (`user`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookmark` ADD CONSTRAINT `FK_fe0a594fdef26d81b2831bbd16b` FOREIGN KEY (`content`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_tag_tag` ADD CONSTRAINT `FK_02dff9435c8ec4dcfbf5217b507` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_tag_tag` ADD CONSTRAINT `FK_5257b52b6d5641add91de83e948` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `content_tag_tag` DROP FOREIGN KEY `FK_5257b52b6d5641add91de83e948`");
        await queryRunner.query("ALTER TABLE `content_tag_tag` DROP FOREIGN KEY `FK_02dff9435c8ec4dcfbf5217b507`");
        await queryRunner.query("ALTER TABLE `bookmark` DROP FOREIGN KEY `FK_fe0a594fdef26d81b2831bbd16b`");
        await queryRunner.query("ALTER TABLE `bookmark` DROP FOREIGN KEY `FK_f510ea7de6cd9737a8abfc76f3b`");
        await queryRunner.query("ALTER TABLE `favourite` DROP FOREIGN KEY `FK_0dc9e57dc307764721a80e274b2`");
        await queryRunner.query("ALTER TABLE `favourite` DROP FOREIGN KEY `FK_44f54717036fa2329ea124dd109`");
        await queryRunner.query("ALTER TABLE `follow` DROP FOREIGN KEY `FK_847c7b957f75e9f3e3f8d3d3047`");
        await queryRunner.query("ALTER TABLE `follow` DROP FOREIGN KEY `FK_903c67798aca5869c297418838b`");
        await queryRunner.query("ALTER TABLE `tag_location_location` DROP FOREIGN KEY `FK_080989334025b8fc6e4bf3a2fc8`");
        await queryRunner.query("ALTER TABLE `tag_location_location` DROP FOREIGN KEY `FK_2f6f4113049bc9140158bb1a0cf`");
        await queryRunner.query("ALTER TABLE `location_content_content` DROP FOREIGN KEY `FK_63a46750c61fca800be5c48f95c`");
        await queryRunner.query("ALTER TABLE `location_content_content` DROP FOREIGN KEY `FK_95e2e085b4e8e9fcc79c9d2560b`");
        await queryRunner.query("ALTER TABLE `content` DROP FOREIGN KEY `FK_cd03caa6e34f3c76d9f1039353c`");
        await queryRunner.query("ALTER TABLE `content` DROP FOREIGN KEY `FK_43185da5e33e99752c6edf91352`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_1688ec3dd5b4545173a167b8ba3`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_25505b3c411138e04bf63123a65`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_3d537956c7ea11bb8ee239e24f2`");
        await queryRunner.query("ALTER TABLE `content_card` DROP FOREIGN KEY `FK_f08ce43aafa2e30719736c066be`");
        await queryRunner.query("ALTER TABLE `content_card` DROP FOREIGN KEY `FK_d9613d6e3cdcbb672c75ee1a66d`");
        await queryRunner.query("DROP INDEX `IDX_5257b52b6d5641add91de83e94` ON `content_tag_tag`");
        await queryRunner.query("DROP INDEX `IDX_02dff9435c8ec4dcfbf5217b50` ON `content_tag_tag`");
        await queryRunner.query("DROP TABLE `content_tag_tag`");
        await queryRunner.query("DROP INDEX `IDX_fe0a594fdef26d81b2831bbd16` ON `bookmark`");
        await queryRunner.query("DROP INDEX `IDX_f510ea7de6cd9737a8abfc76f3` ON `bookmark`");
        await queryRunner.query("DROP TABLE `bookmark`");
        await queryRunner.query("DROP INDEX `IDX_0dc9e57dc307764721a80e274b` ON `favourite`");
        await queryRunner.query("DROP INDEX `IDX_44f54717036fa2329ea124dd10` ON `favourite`");
        await queryRunner.query("DROP TABLE `favourite`");
        await queryRunner.query("DROP INDEX `IDX_847c7b957f75e9f3e3f8d3d304` ON `follow`");
        await queryRunner.query("DROP INDEX `IDX_903c67798aca5869c297418838` ON `follow`");
        await queryRunner.query("DROP TABLE `follow`");
        await queryRunner.query("DROP INDEX `IDX_080989334025b8fc6e4bf3a2fc` ON `tag_location_location`");
        await queryRunner.query("DROP INDEX `IDX_2f6f4113049bc9140158bb1a0c` ON `tag_location_location`");
        await queryRunner.query("DROP TABLE `tag_location_location`");
        await queryRunner.query("DROP INDEX `IDX_63a46750c61fca800be5c48f95` ON `location_content_content`");
        await queryRunner.query("DROP INDEX `IDX_95e2e085b4e8e9fcc79c9d2560` ON `location_content_content`");
        await queryRunner.query("DROP TABLE `location_content_content`");
        await queryRunner.query("DROP INDEX `REL_cd03caa6e34f3c76d9f1039353` ON `content`");
        await queryRunner.query("DROP TABLE `content`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP INDEX `REL_1688ec3dd5b4545173a167b8ba` ON `imagecard`");
        await queryRunner.query("DROP INDEX `REL_25505b3c411138e04bf63123a6` ON `imagecard`");
        await queryRunner.query("DROP TABLE `imagecard`");
        await queryRunner.query("DROP INDEX `REL_d9613d6e3cdcbb672c75ee1a66` ON `content_card`");
        await queryRunner.query("DROP TABLE `content_card`");
        await queryRunner.query("DROP TABLE `image`");
        await queryRunner.query("DROP TABLE `tag`");
        await queryRunner.query("DROP TABLE `location`");
    }

}
