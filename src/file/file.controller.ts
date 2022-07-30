import { ConfigService } from '@nestjs/config';
import { GroupService } from './../group/group.service';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { CreateFileDto } from './dto/create-file.dto';
import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  Session,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'node:path';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import { S3BucketService } from 'src/aws/s3-bucket.service';
import { Readable } from 'node:stream';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly groupService: GroupService,
    private readonly s3BucketService: S3BucketService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async createFile(
    @Session() session: SessionContainer,
    @Body() { groupId }: CreateFileDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const authId = session.getUserId();
    const belongsToGroup = await this.groupService.userBelongsToRoom(
      authId,
      groupId,
    );
    if (!belongsToGroup) throw new ForbiddenException();
    if (!files.length) throw new BadRequestException('No files uploaded');
    const filePaths = await this.s3BucketService.uploadFile(groupId, files);
    const createFiles = await this.fileService.createFiles(
      authId,
      groupId,
      files,
      filePaths,
    );
    return createFiles;
  }
  @Get()
  async getAllFiles(@Query('page', new DefaultValuePipe(1)) page: number) {
    return this.fileService.getAllFiles(page);
  }
  @Delete()
  async deleteAllFiles() {
    return this.fileService.deleteAllFIles();
  }
  @Delete('/:groupId/:fileId')
  async deleteFile(
    @Session() session: SessionContainer,
    @Param('groupId') groupId: string,
    @Param('fileId') fileId: string,
  ) {
    const authId = session.getUserId();

    const userBelongsToRoom = await this.groupService.userBelongsToRoom(
      authId,
      groupId,
    );
    return this.fileService.deleteAllFIles();
  }
  @Public()
  @Get('/:groupId/:fileId')
  async downloadFile(
    @Res({ passthrough: true }) res: Response,
    // @Session() session: SessionContainer,
    @Param('groupId')
    groupId: string,
    @Param('fileId') fileId: string,
  ): Promise<StreamableFile> {
    const filePath = path.join(groupId, fileId);
    // const authId = session.getUserId();
    // const group = await this.groupService.userBelongsToRoom(authId, groupId);
    // if (!group.participants.length) throw new ForbiddenException();
    const getFile = await this.fileService.getFileByPath(filePath);
    if (!getFile) throw new NotFoundException();

    const s3File = await this.s3BucketService.getFile(filePath);

    if (s3File.$metadata.httpStatusCode !== 200)
      throw new BadRequestException();
    res.set({
      'Content-Disposition': `attachment; filename=${getFile.originalName}`,
    });
    return new StreamableFile(s3File.Body as Readable);
  }
}
