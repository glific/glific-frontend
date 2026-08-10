export interface KnowledgeBaseFile {
  fileId: string;
  filename: string;
  fileSize?: number | null;
  uploadedAt?: string | null;
}

export interface UploadError {
  message?: string;
  networkError?: { statusCode?: number; status?: number; message?: string };
  graphQLErrors?: { extensions?: { code?: string } }[];
}
