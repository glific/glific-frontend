import { extractFiles } from 'config/extractFiles';

// jsdom doesn't let us call `new FileList()` directly, so we build a fake
// array-like object that satisfies `instanceof FileList` the same way a
// real `<input type="file">` FileList would.
const buildFakeFileList = (files: File[]): FileList => {
  const fileList = Object.create(FileList.prototype);
  files.forEach((file, index) => {
    fileList[index] = file;
  });
  Object.defineProperty(fileList, 'length', { value: files.length });
  return fileList as FileList;
};

describe('extractFiles', () => {
  it('returns empty files and an empty object for null variables', () => {
    const result = extractFiles(null);

    expect(result.files).toEqual([]);
    expect(result.variables).toEqual({});
  });

  it('returns empty files and an empty object for undefined variables', () => {
    const result = extractFiles(undefined);

    expect(result.files).toEqual([]);
    expect(result.variables).toEqual({});
  });

  it('leaves plain scalar values untouched when there are no files', () => {
    const variables = { name: 'Glific', count: 5, active: true, note: null };

    const result = extractFiles(variables);

    expect(result.files).toEqual([]);
    expect(result.variables).toEqual(variables);
  });

  it('recurses into nested plain objects that contain no files', () => {
    const variables = { input: { title: 'Hello', meta: { language: 'en' } } };

    const result = extractFiles(variables);

    expect(result.files).toEqual([]);
    expect(result.variables).toEqual(variables);
  });

  it('recurses into arrays and rewrites the array via walkTree', () => {
    const variables = { items: [{ label: 'a' }, { label: 'b' }] };

    const result = extractFiles(variables);

    expect(result.files).toEqual([]);
    expect(result.variables).toEqual(variables);
    expect(Array.isArray(result.variables.items)).toBe(true);
  });

  it('extracts a top-level File and replaces it with a path placeholder', () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const variables = { media: file };

    const result = extractFiles(variables);

    expect(result.files).toEqual([{ name: 'media', file }]);
    expect(result.variables).toEqual({ media: 'media' });
  });

  it('extracts a FileList and converts it into an array of files', () => {
    const file1 = new File(['a'], 'a.txt');
    const file2 = new File(['b'], 'b.txt');
    const fileList = buildFakeFileList([file1, file2]);
    const variables = { attachments: fileList };

    const result = extractFiles(variables);

    expect(result.files).toEqual([{ name: 'attachments', file: [file1, file2] }]);
    expect(result.variables).toEqual({ attachments: 'attachments' });
  });

  it('extracts a File nested several levels deep and builds a dotted path name', () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const variables = { input: { profile: { avatar: file } } };

    const result = extractFiles(variables);

    expect(result.files).toEqual([{ name: 'input.profile.avatar', file }]);
    expect(result.variables).toEqual({ input: { profile: { avatar: 'input.profile.avatar' } } });
  });

  it('extracts multiple files (File and FileList) alongside untouched scalar fields', () => {
    const avatar = new File(['avatar'], 'avatar.png');
    const doc1 = new File(['d1'], 'd1.pdf');
    const doc2 = new File(['d2'], 'd2.pdf');
    const docs = buildFakeFileList([doc1, doc2]);

    const variables = {
      title: 'Profile update',
      user: { name: 'Ada', avatar },
      documents: docs,
    };

    const result = extractFiles(variables);

    expect(result.files).toEqual([
      { name: 'user.avatar', file: avatar },
      { name: 'documents', file: [doc1, doc2] },
    ]);
    expect(result.variables).toEqual({
      title: 'Profile update',
      user: { name: 'Ada', avatar: 'user.avatar' },
      documents: 'documents',
    });
  });
});
