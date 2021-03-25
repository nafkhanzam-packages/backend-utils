import fs from "fs-extra";
import path from "path";
import {Transform} from "stream";
import {FileUpload} from "graphql-upload";

const deleteFile = async (filePath: string) => {
  await fs.remove(filePath);
};

type UploadType =
  | {
      file: FileUpload;
      promise: Promise<FileUpload>;
    }
  | FileUpload
  | Promise<FileUpload>;

const convertGQLToUploadType = (gqlFile: UploadType) => {
  return "file" in gqlFile ? gqlFile.file || gqlFile.promise : gqlFile;
};

const uploadFile = async (
  filePromise: Promise<FileUpload>,
  filePath: string,
  options?: {
    maxByteSize?: number;
    acceptedExtension?: string[];
    forceReplace?: boolean;
  },
): Promise<void> => {
  const file = await filePromise;
  const parsed = path.parse(filePath);
  if ((await fs.pathExists(filePath)) && !options?.forceReplace) {
    throw new Error(`File ${filePath} already exists!`);
  }
  await fs.ensureDir(parsed.dir);
  const {ext} = path.parse(file.filename);
  const exts = options?.acceptedExtension;
  if (exts && exts.length && !exts.includes(ext.substr(1))) {
    throw new Error(
      `File extension must be one of the following: [${exts.join(", ")}].`,
    );
  }
  const writer = fs.createWriteStream(filePath);
  const reader = file.createReadStream();
  try {
    await sendBytes(writer, reader, options?.maxByteSize);
  } catch (error) {
    await deleteFile(filePath);
    throw error;
  } finally {
    writer.close();
    reader.close();
  }
};

export const uploadUtils = {
  deleteFile,
  convertGQLToUploadType,
  uploadFile,
};

async function sendBytes(
  writer: fs.WriteStream,
  reader: fs.ReadStream,
  maxByteSize?: number,
) {
  return new Promise<void>((resolve, reject) => {
    reader.on("error", (e) => {
      writer.destroy(e);
      reject(e);
    });
    writer.on("error", (e) => {
      reader.destroy(e);
      reject(e);
    });
    writer.on("close", () => {
      reader.destroy();
      resolve();
    });
    if (maxByteSize !== undefined) {
      const counter = new Counter(maxByteSize);
      counter.on("error", (e) => {
        reader.destroy(e);
        writer.destroy(e);
        reject(e);
      });
      reader.pipe(counter).pipe(writer);
      return;
    }
    reader.pipe(writer);
  });
}

class Counter extends Transform {
  private length: number = 0;
  constructor(private maxByteSize: number) {
    super();
  }
  _transform(chunk: any, _: unknown, callback: Function) {
    this.length += chunk.length;

    if (this.length > this.maxByteSize) {
      this.destroy(
        new Error(`Max file size of ${this.maxByteSize} bytes exceeded.`),
      );
      return;
    }

    this.push(chunk);
    callback();
  }
}
