import { UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';

export const knowledgeBaseOptionsBaseProps = {
  formikValues: {
    initialFiles: [],
    knowledgeBaseVersionId: '',
    knowledgeBaseName: '',
    temperature: 1,
  },
  setFieldValue: () => {},
  formikErrors: {},
  formikTouched: {},
  knowledgeBaseId: 'kb-1',
  isLegacyVectorStore: false,
  onFilesChange: () => {},
  vectorStoreId: 'vs-1',
  validateForm: () => {},
  disabled: false,
};

export const createUploadSuccessMock = (filename: string, delay?: number) => ({
  request: { query: UPLOAD_FILE_TO_KAAPI },
  variableMatcher: (variables: any) => variables?.media?.name === filename,
  ...(delay !== undefined ? { delay } : {}),
  result: {
    data: {
      uploadFilesearchFile: {
        fileId: `id-${filename}`,
        filename,
        uploadedAt: '2026-01-01',
        fileSize: 12,
      },
    },
  },
});

export const createUploadErrorMock = (filename: string, error: Error, delay?: number) => ({
  request: { query: UPLOAD_FILE_TO_KAAPI },
  variableMatcher: (variables: any) => variables?.media?.name === filename,
  ...(delay !== undefined ? { delay } : {}),
  error,
});

export const rateLimitError = (() => {
  const err = new Error('429 Too Many Requests');
  (err as any).networkError = { statusCode: 429 };
  return err;
})();
