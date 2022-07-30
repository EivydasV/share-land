import {
  PutObjectCommand,
  S3Client,
  PutObjectCommandInput,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { nanoid } from 'nanoid';
import awsConfig from './aws.config';

@Injectable()
export class S3BucketService {
  private readonly client = new S3Client({
    region: this.config.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: this.config.AWS_ACCESS_KEY,
      secretAccessKey: this.config.AWS_SECRET_KEY,
    },
  });
  constructor(
    @Inject(awsConfig.KEY)
    private readonly config: ConfigType<typeof awsConfig>,
  ) {}

  async uploadFile(folder: string, files: Express.Multer.File[]) {
    const dests: string[] = [];
    const params = files.map((file): PutObjectCommandInput => {
      const key = `${folder}/${nanoid()}.${file.mimetype.split('/')[1]}`;
      dests.push(key);
      return {
        Bucket: this.config.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
      };
    });
    await Promise.all(
      params.map((param) => this.client.send(new PutObjectCommand(param))),
    );
    return dests;
  }
  async getFile(key: string) {
    return this.client.send(
      new GetObjectCommand({
        Bucket: this.config.AWS_BUCKET_NAME,
        Key: key,
      }),
    );
  }
  async deleteFile(key: string) {
    return this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.AWS_BUCKET_NAME,
        Key: key,
      }),
    );
  }
}
