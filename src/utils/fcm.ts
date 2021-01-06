import gcm from "node-gcm";

export class FcmUtils {
  private sender: gcm.Sender;
  constructor(args: {fcmServerKey: string}) {
    this.sender = new gcm.Sender(args.fcmServerKey);
  }

  public async sendNotification(args: {
    token: string | string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<gcm.IResponseBody> {
    const message = new gcm.Message({
      notification: {
        icon: "",
        title: args.title,
        body: args.body,
        sound: "default",
        badge: "1",
      },
      data: args.data,
      priority: "high",
    });

    const {token} = args;

    return new Promise((resolve, reject) =>
      this.sender.send(
        message,
        typeof token === "string" ? [token] : token,
        (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        },
      ),
    );
  }
}
