import path from "path";

export class PublicFileManager<T extends Record<string, string>> {
  constructor(
    public urlPrefix: string,
    public rootFolder: string,
    public paths: T,
  ) {}

  createPath(
    folder: keyof T,
    filename: string,
    opts?: {extFrom?: string; ext?: string},
  ) {
    const {extFrom, ext} = opts ?? {};
    if (ext) {
      filename += `.${ext}`;
    } else if (extFrom) {
      const parsed = path.parse(extFrom);
      filename += parsed.ext;
    }
    return path.join(this.rootFolder, this.paths[folder], filename);
  }

  createUrl(filePath: string) {
    return `${this.urlPrefix}/${filePath}`;
  }
}
