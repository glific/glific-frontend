import { vi } from 'vitest';

import { CREATE_KNOWLEDGE_BASE, UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';

type MutationImpl = (args: {
  variables: Record<string, unknown>;
  onCompleted: (payload: any) => void;
  onError: (payload: any) => void;
}) => Promise<unknown> | unknown;

export const createAssistantOptionsMutationMocks = ({
  uploadImpl,
  createKnowledgeBaseImpl,
}: {
  uploadImpl?: MutationImpl;
  createKnowledgeBaseImpl?: MutationImpl;
} = {}) => {
  const uploadMutation = uploadImpl || vi.fn(() => Promise.resolve({}));
  const createKnowledgeBaseMutation = createKnowledgeBaseImpl || vi.fn(() => Promise.resolve({}));

  const mutationMocks = [
    {
      request: {
        query: UPLOAD_FILE_TO_KAAPI,
      },
      variableMatcher: () => true,
      maxUsageCount: Number.POSITIVE_INFINITY,
      result: (variables: Record<string, unknown>) => {
        const mutationVariables = (variables as any)?.variables || variables;
        let completedPayload: any;
        let erroredPayload: any;
        uploadMutation({
          variables: mutationVariables,
          onCompleted: (payload: any) => {
            completedPayload = payload;
          },
          onError: (payload: any) => {
            erroredPayload = payload;
          },
        });

        if (erroredPayload) {
          throw erroredPayload;
        }

        if (completedPayload) {
          return {
            data: completedPayload,
          };
        }

        return {
          data: {},
        };
      },
    },
    {
      request: {
        query: CREATE_KNOWLEDGE_BASE,
      },
      variableMatcher: () => true,
      maxUsageCount: Number.POSITIVE_INFINITY,
      result: (variables: Record<string, unknown>) => {
        const mutationVariables = (variables as any)?.variables || variables;
        let completedPayload: any;
        let erroredPayload: any;
        createKnowledgeBaseMutation({
          variables: mutationVariables,
          onCompleted: (payload: any) => {
            completedPayload = payload;
          },
          onError: (payload: any) => {
            erroredPayload = payload;
          },
        });

        if (erroredPayload) {
          throw erroredPayload;
        }

        if (completedPayload) {
          return {
            data: completedPayload,
          };
        }

        return {
          data: {
            createKnowledgeBase: {
              knowledgeBase: {
                id: 'kb-1',
                knowledgeBaseVersionId: 'kbv-1',
                name: 'Knowledge Base',
              },
            },
          },
        };
      },
    },
  ];

  return { mutationMocks, uploadMutation, createKnowledgeBaseMutation };
};
