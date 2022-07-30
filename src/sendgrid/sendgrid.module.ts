import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import sendgridConfig from './sendgrid.config';
import { SendgridService } from './sendgrid.service';

@Module({
  imports: [ConfigModule.forFeature(sendgridConfig)],
  providers: [SendgridService],
})
export class SendgridModule {}
