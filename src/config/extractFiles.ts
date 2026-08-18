// Ported from apollo-absinthe-upload-link (https://github.com/bytewitchcraft/apollo-absinthe-upload-link),
// which is unmaintained and incompatible with Apollo Client 4. This logic is framework-agnostic
// (walks a variables tree pulling out File/FileList instances) and has no Apollo dependency, so it's
// copied here verbatim rather than reimplemented.
export interface ExtractedFile {
  name: string;
  file: File | File[];
}

const isFileList = (value: any): value is FileList => typeof FileList !== 'undefined' && value instanceof FileList;
const isUploadFile = (value: any): value is File => typeof File !== 'undefined' && value instanceof File;
const isPlainObject = (value: any): boolean =>
  value !== null && typeof value === 'object' && !isUploadFile(value) && !isFileList(value);

export const extractFiles = (variables: any): { variables: any; files: ExtractedFile[] } => {
  const files: ExtractedFile[] = [];

  const walkTree = (tree: any, path: string[] = []): any => {
    const mapped: any = Array.isArray(tree) ? [...tree] : { ...tree };

    Object.keys(mapped).forEach((key) => {
      const value = mapped[key];
      const name = [...path, key].join('.');

      if (isUploadFile(value) || isFileList(value)) {
        const file = isFileList(value) ? Array.prototype.slice.call(value) : value;
        files.push({ file, name });
        mapped[key] = name;
      } else if (isPlainObject(value)) {
        mapped[key] = walkTree(value, [...path, key]);
      }
    });

    return mapped;
  };

  return {
    files,
    variables: walkTree(variables),
  };
};

export default extractFiles;
