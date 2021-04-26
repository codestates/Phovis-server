import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRefactoring1619440614679 implements MigrationInterface {
    name = 'PostRefactoring1619440614679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_b7473697b60e231fcbf9ff70f21`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_1688ec3dd5b4545173a167b8ba3`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_3d537956c7ea11bb8ee239e24f2`");
        await queryRunner.query("DROP INDEX `IDX_1688ec3dd5b4545173a167b8ba` ON `imagecard`");
        await queryRunner.query("DROP INDEX `IDX_b7473697b60e231fcbf9ff70f2` ON `imagecard`");
        await queryRunner.query("DROP INDEX `REL_b7473697b60e231fcbf9ff70f2` ON `imagecard`");
        await queryRunner.query("DROP INDEX `REL_1688ec3dd5b4545173a167b8ba` ON `imagecard`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP COLUMN `contentId`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP COLUMN `userId`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP COLUMN `locationId`");
        await queryRunner.query("ALTER TABLE `imagecard` ADD `userId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `imagecard` ADD `locationId` int NULL");
        await queryRunner.query("ALTER TABLE `imagecard` ADD UNIQUE INDEX `IDX_1688ec3dd5b4545173a167b8ba` (`locationId`)");
        await queryRunner.query("ALTER TABLE `imagecard` ADD `contentId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `imagecard` ADD UNIQUE INDEX `IDX_b7473697b60e231fcbf9ff70f2` (`contentId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_1688ec3dd5b4545173a167b8ba` ON `imagecard` (`locationId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_b7473697b60e231fcbf9ff70f2` ON `imagecard` (`contentId`)");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_3d537956c7ea11bb8ee239e24f2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_1688ec3dd5b4545173a167b8ba3` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_b7473697b60e231fcbf9ff70f21` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_b7473697b60e231fcbf9ff70f21`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_1688ec3dd5b4545173a167b8ba3`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP FOREIGN KEY `FK_3d537956c7ea11bb8ee239e24f2`");
        await queryRunner.query("DROP INDEX `REL_b7473697b60e231fcbf9ff70f2` ON `imagecard`");
        await queryRunner.query("DROP INDEX `REL_1688ec3dd5b4545173a167b8ba` ON `imagecard`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP INDEX `IDX_b7473697b60e231fcbf9ff70f2`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP COLUMN `contentId`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP INDEX `IDX_1688ec3dd5b4545173a167b8ba`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP COLUMN `locationId`");
        await queryRunner.query("ALTER TABLE `imagecard` DROP COLUMN `userId`");
        await queryRunner.query("ALTER TABLE `imagecard` ADD `locationId` int NULL");
        await queryRunner.query("ALTER TABLE `imagecard` ADD `userId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `imagecard` ADD `contentId` varchar(36) NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_1688ec3dd5b4545173a167b8ba` ON `imagecard` (`locationId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_b7473697b60e231fcbf9ff70f2` ON `imagecard` (`contentId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_b7473697b60e231fcbf9ff70f2` ON `imagecard` (`contentId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_1688ec3dd5b4545173a167b8ba` ON `imagecard` (`locationId`)");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_3d537956c7ea11bb8ee239e24f2` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_1688ec3dd5b4545173a167b8ba3` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `imagecard` ADD CONSTRAINT `FK_b7473697b60e231fcbf9ff70f21` FOREIGN KEY (`contentId`) REFERENCES `content`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
