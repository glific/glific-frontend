import { LIST_WHATSAPP_FORM_REVISIONS } from 'graphql/queries/WhatsAppForm';
import { REVERT_TO_WHATSAPP_FORM_REVISION } from 'graphql/mutations/WhatsAppForm';

// Mock revisions in the format the component expects (flat structure matching Revision interface)
export const mockRevisions = [
    {
        id: '1',
        revisionNumber: 3,
        insertedAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        definition: '{"version": "7.3", "screens": []}',
    },
    {
        id: '2',
        revisionNumber: 2,
        insertedAt: '2024-01-14T09:20:00Z',
        updatedAt: '2024-01-14T09:20:00Z',
        definition: '{"version": "7.2", "screens": []}',
    },
    {
        id: '3',
        revisionNumber: 1,
        insertedAt: '2024-01-13T08:10:00Z',
        updatedAt: '2024-01-13T08:10:00Z',
        definition: '{"version": "7.1", "screens": []}',
    },
];

export const listRevisionsMock = {
    request: {
        query: LIST_WHATSAPP_FORM_REVISIONS,
        variables: {
            whatsappFormId: 'form-1',
            limit: 10,
        },
    },
    result: {
        data: {
            listWhatsappFormRevisions: mockRevisions,
        },
    },
};

export const listRevisionsEmptyMock = {
    request: {
        query: LIST_WHATSAPP_FORM_REVISIONS,
        variables: {
            whatsappFormId: 'form-1',
            limit: 10,
        },
    },
    result: {
        data: {
            listWhatsappFormRevisions: [],
        },
    },
};

export const listRevisionsLoadingMock = {
    request: {
        query: LIST_WHATSAPP_FORM_REVISIONS,
        variables: {
            whatsappFormId: 'form-1',
            limit: 10,
        },
    },
    result: {
        data: {
            listWhatsappFormRevisions: mockRevisions,
        },
    },
    delay: 100,
};

export const revertRevisionMock = {
    request: {
        query: REVERT_TO_WHATSAPP_FORM_REVISION,
        variables: {
            whatsappFormId: 'form-1',
            revisionId: '2',
        },
    },
    result: {
        data: {
            revertToWhatsappFormRevision: {
                whatsappFormRevision: {
                    definition: '{"version": "7.2", "screens": []}',
                },
                errors: null,
            },
        },
    },
};

export const revertRevisionErrorMock = {
    request: {
        query: REVERT_TO_WHATSAPP_FORM_REVISION,
        variables: {
            whatsappFormId: 'form-1',
            revisionId: '2',
        },
    },
    error: new Error('Failed to revert'),
};
