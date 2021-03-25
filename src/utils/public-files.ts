import path from "path";

export class PublicFileManager<T extends Record<string, string>> {
  constructor(public rootFolder: string, public paths: T) {}

  createPath(folder: keyof T, filename: string, opts?: {extFrom?: string}) {
    const {extFrom} = opts ?? {};
    if (extFrom) {
      const parsed = path.parse(extFrom);
      filename += parsed.ext;
    }
    return path.join(this.rootFolder, this.paths[folder], filename);
  }
}
