import { GroupService } from './../group/group.service';
import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileController } from './file.controller';
import * as multer from 'multer';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async () => ({
        limits: { fileSize: 20000000, files: 10 },
        storage: multer.memoryStorage(),
      }),
    }),
    AwsModule,
  ],
  controllers: [FileController],
  providers: [FileService, GroupService],
})
export class FileModule {}
