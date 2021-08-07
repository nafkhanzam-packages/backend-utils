import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export class EmailUtils {
  private mail: Mail;

  constructor(args: {
    type: "default";
    host: string;
    port: number;
    auth: {user: string; password: string};
  }) {
    this.mail = nodemailer.createTransport({
      host: args.host,
      port: args.port,
      auth: {
        user: args.auth.user,
        pass: args.auth.password,
      },
    });
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
