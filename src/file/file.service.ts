import { createPrismaOffsetPagination } from './../utils/prisma/pagination';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { outputFile } from 'fs-extra';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async createFiles(
    authId: string,
    groupId: string,
    files: Express.Multer.File[],
    filePaths: string[],
  ) {
    const dests: string[] = [];
    const query = await this.prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        files: {
          createMany: {
            data: files.map((file, index) => {
              return {
                originalName: file.originalname,
                sentById: authId,
                path: filePaths[index],
                size: file.size,
              };
            }),
          },
        },
      },
      select: {
        files: {
          where: { sentById: authId },
          orderBy: { createdAt: 'desc' },
          take: files.length,
        },
      },
    });

    const writeFiles = dests.map((dest, index) => {
      return outputFile(dest, files[index].buffer);
    });
    await Promise.all(writeFiles);

    return query.files;
  }

  async getAllFiles(page: number) {
    const { paginate, skip, take } = createPrismaOffsetPagination({ page });
    const queryPromise = this.prisma.file.findMany({
      take,
      skip,
    });
    const countPromise = this.prisma.file.count();
    const [query, count] = await Promise.all([queryPromise, countPromise]);
    return paginate(query, count);
  }
  async deleteAllFIles() {
    return this.prisma.file.deleteMany({});
  }
  async deleteFIle(fileId: string) {
    return this.prisma.file.delete({
      where: {
        id: fileId,
      },
    });
  }
  async increaseDownloadCount(fileId: string) {
    return this.prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        downloandCount: { increment: 1 },
      },
    });
  }
  async getFileByPath(path: string) {
    return this.prisma.file.findUnique({
      where: {
        path,
      },
    });
  }
}
