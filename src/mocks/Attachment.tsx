import { CREATE_MEDIA_MESSAGE, UPLOAD_MEDIA, UPLOAD_MEDIA_BLOB } from 'graphql/mutations/Chat';
import GET_ATTACHMENT_PERMISSION from 'graphql/queries/Settings';

export const getAttachmentPermissionMock = {
  request: {
    query: GET_ATTACHMENT_PERMISSION,
  },
  result: {
    data: {
      attachmentsEnabled: true,
    },
  },
};

export const uploadBlobMock = {
  request: {
    query: UPLOAD_MEDIA_BLOB,
    variables: {
      media: '',
      extension: 'mp3',
    },
  },
  result: {
    data: {
      uploadBlob: 'https://test.wav',
    },
  },
};

export const createMediaMessageMock = {
  request: {
    query: CREATE_MEDIA_MESSAGE,
    variables: {
      input: {
        caption: '',
        sourceUrl: 'https://test.wav',
        url: 'https://test.wav',
      },
    },
  },
  result: {
    data: {
      createMessageMedia: {
        messageMedia: {
          id: '1',
        },
      },
    },
  },
};

export const uploadMediaMock = {
  request: {
    query: UPLOAD_MEDIA,
    variables: { media: { name: 'photo.png' }, extension: 'png' },
  },
  result: {
    data: {
      uploadMedia: 'https://gcs.test.com/ssdssnkss',
    },
  },
};

export const uploadMediaErrorMock = {
  request: {
    query: UPLOAD_MEDIA,
    variables: { media: { name: 'photo.png' }, extension: 'png' }
  },
  error: new Error('An error occurred')
}
