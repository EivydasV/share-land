import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import sendgridConfig from './sendgrid.config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(
    @Inject(sendgridConfig.KEY)
    private readonly config: ConfigType<typeof sendgridConfig>,
  ) {
    SendGrid.setApiKey(this.config.SENDGRID_API_KEY);
  }
  async send(mail: Required<Omit<SendGrid.MailDataRequired, 'from'>>) {
    const transport = await SendGrid.send(mail as SendGrid.MailDataRequired);
    // avoid this on production. use log instead :)
    console.log(`E-Mail sent to ${mail.to}`);
    return transport;
  }
  async test() {
    this.send({
      to: 'fdfd',
      subject: 'Hello from sendgrid',
      text: 'Hello',
      html: '<h1>Hello</h1>',
      from: 'd',
    });
  }
}
