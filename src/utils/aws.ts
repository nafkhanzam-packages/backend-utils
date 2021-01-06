import AWS from "aws-sdk";
import fs from "fs-extra";

export class AWSUtils {
  private s3: AWS.S3;
  constructor(args: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }) {
    const options: AWS.S3.ClientConfiguration = {
      accessKeyId: args.accessKeyId,
      secretAccessKey: args.secretAccessKey,
      region: args.region,
    };

    this.s3 = new AWS.S3(options);
  }

  uploadS3 = async (args: {
    bucket: string;
    key: string;
    reader: fs.ReadStream;
  }) => {
    return new Promise<void>((resolve, reject) => {
      this.s3.upload(
        {
          Bucket: args.bucket,
          Key: args.key,
          Body: args.reader,
        },
        (err) => {
          args.reader.destroy();
          if (err) {
            reject(err);
            return;
          }
          resolve();
        },
      );
    });
  };
}
