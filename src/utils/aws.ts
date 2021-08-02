import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import memoizee from "memoizee";

type MemoizeFn = (path: string) => Promise<string>;
type MemoizeType = memoizee.Memoized<MemoizeFn> & MemoizeFn;

export class S3Utils {
  bucketName: string;
  s3: S3Client;
  expiresInSeconds: number = 3600;
  memoizedDownloadUrl: MemoizeType;
  memoizedUploadUrl: MemoizeType;
  constructor(args: {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    endpoint?: string;
    region?: string;
  }) {
    this.s3 = new S3Client({
      endpoint: args.endpoint,
      region: args.region,
      credentials: {
        accessKeyId: args.accessKeyId,
        secretAccessKey: args.secretAccessKey,
      },
    });
    this.bucketName = args.bucket;

    const maxAge = ((this.expiresInSeconds * 2) / 3) * 1000;
    this.memoizedDownloadUrl = memoizee(
      async (path: string) => {
        const res = await this.createSignedDownloadUrl(path, undefined, true);
        return res;
      },
      {async: true, maxAge},
    );
    this.memoizedUploadUrl = memoizee(
      async (path: string) => {
        const res = await this.createSignedUploadUrl(path, undefined, true);
        return res;
      },
      {async: true, maxAge},
    );
  }

  async upload(path: string, buf: Buffer): Promise<void> {
    const uploader = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: path,
      Body: buf,
    });

    await this.s3.send(uploader);
  }

  async createSignedUploadUrl(
    path: string,
    options?: {
      contentLength?: number;
    },
    force = false,
  ): Promise<string> {
    if (!force) {
      return this.memoizedUploadUrl(path);
    }
    const uploader = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: path,
      ContentLength: options?.contentLength,
    });

    const url = await getSignedUrl(this.s3, uploader, {
      expiresIn: this.expiresInSeconds,
    });
    return url;
  }

  async download(path: string) {
    const downloader = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    const res = await this.s3.send(downloader);
    return res.Body;
  }

  async createSignedDownloadUrl(
    path: string,
    options?: {},
    force = false,
  ): Promise<string> {
    if (!force) {
      return this.memoizedDownloadUrl(path);
    }
    const downloader = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    const url = await getSignedUrl(this.s3, downloader, {
      expiresIn: this.expiresInSeconds,
    });
    return url;
  }
}
