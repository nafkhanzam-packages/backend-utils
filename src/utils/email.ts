import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class EmailUtils {
  private mail: Mail;

  constructor(args: {
    host: string;
    port: number;
    auth: {user: string; password: string};
  }) {
    const options: SMTPTransport.Options = {
      host: args.host,
      port: args.port,
      auth: {
        user: args.auth.user,
        pass: args.auth.password,
      },
    };

    this.mail = nodemailer.createTransport(options);
  }

  sendMail = async (args: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) => {
    await this.mail.sendMail({
      from: args.from,
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: args.html,
    });
  };
}
