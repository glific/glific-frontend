import {
  CREATE_INTERACTIVE,
  DELETE_INTERACTIVE,
  EXPORT_INTERACTIVE_TEMPLATE,
  IMPORT_INTERACTIVE_TEMPLATE,
  TRANSLATE_INTERACTIVE_TEMPLATE,
  UPDATE_INTERACTIVE,
} from 'graphql/mutations/InteractiveMessage';
import {
  FILTER_INTERACTIVE_MESSAGES,
  GET_INTERACTIVE_MESSAGES_COUNT,
  GET_INTERACTIVE_MESSAGE,
} from 'graphql/queries/InteractiveMessage';
import { getOrganizationLanguagesWithoutOrder } from './Organization';
import { getFilterTagQuery } from './Tag';

const filterInteractiveFunction = (filter: any, opts: any) => ({
  request: {
    query: FILTER_INTERACTIVE_MESSAGES,
    variables: {
      filter,
      opts,
    },
  },
  result: {
    data: {
      interactiveTemplates: [
        {
          id: '1',
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"yes"},{"type":"text","title":"no"}],"content":{"type":"text","text":"Glific comes with all new features","header":"Are you excited for *Glific*?"}}',
          label: 'Are you excited for Glific?',
          language: {
            id: '1',
            label: 'English',
          },
          sendWithTitle: true,
          translations:
            '{"2":{"type":"quick_reply","options":[{"type":"text","title":"हाँ"},{"type":"text","title":"ना"}],"content":{"type":"text","text":"ग्लिफ़िक सभी नई सुविधाओं के साथ आता है","header":"आप ग्लिफ़िक के लिए कितने उत्साहित हैं?"}},"1":{"type":"quick_reply","options":[{"type":"text","title":"yes"},{"type":"text","title":"no"}],"content":{"type":"text","text":"Glific comes with all new features","header":"Are you excited for *Glific*?"}}}',
          type: 'QUICK_REPLY',
        },
        {
          id: '2',
          label: 'quick reply document',
          type: 'QUICK_REPLY',
          translations: '{}',
          language: {
            id: '1',
            label: 'English',
          },
          sendWithTitle: true,
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"First"},{"type":"text","title":"Second"},{"type":"text","title":"Third"}],"content":{"url":"http://enterprise.smsgupshup.com/doc/GatewayAPIDoc.pdf","type":"file","filename":"Sample file"}}',
        },
        {
          id: '3',
          label: 'quick reply image',
          type: 'QUICK_REPLY',
          translations:
            '{"1": {"type": "quick_reply", "content": {"url": "https://picsum.photos/200/300", "type": "image", "caption": "body text"}, "options": [{"type": "text", "title": "First"}, {"type": "text", "title": "Second"}, {"type": "text", "title": "Third"}]}, "2": {"type": "quick_reply", "content": {"url": "https://i.picsum.photos/id/202/200/300.jpg?hmac=KWOdj8XRnO9x8h_I9rIbscSAhD1x-TwkSPPYjWLN2sI", "type": "image", "caption": "यह संदेश है."}, "options": [{"type": "text", "title": "पहला"}, {"type": "text", "title": "दूसरा"}, {"type": "text", "title": "थ्रिड"}]}}',
          language: {
            id: '1',
            label: 'English',
          },
          sendWithTitle: true,
          interactiveContent:
            '{"type": "quick_reply", "content": {"url": "https://picsum.photos/200/300", "type": "image", "caption": "body text"}, "options": [{"type": "text", "title": "First"}, {"type": "text", "title": "Second"}, {"type": "text", "title": "Third"}]}',
        },
        {
          id: '4',
          label: 'quick reply text',
          type: 'QUICK_REPLY',
          translations: '{}',
          language: {
            id: '1',
            label: 'English',
          },
          sendWithTitle: true,
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"Excited"},{"type":"text","title":"Very Excited"}],"content":{"type":"text","text":"How excited are you for Glific?"}}',
        },
        {
          id: '5',
          label: 'quick reply video',
          type: 'QUICK_REPLY',
          translations: '{}',
          language: {
            id: '1',
            label: 'English',
          },
          sendWithTitle: true,
          interactiveContent:
            '{"type": "quick_reply", "content": {"url": "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4", "type": "video", "caption": "Sample video"}, "options": [{"type": "text", "title": "First"}, {"type": "text", "title": "Second"}, {"type": "text", "title": "Third"}]}',
        },
      ],
    },
  },
});

export const filterInteractiveQuery = filterInteractiveFunction(
  {},
  {
    limit: 50,
    offset: 0,
    order: 'ASC',
    orderWith: 'label',
  }
);

export const filterByTagInteractiveQuery = filterInteractiveFunction(
  { tagIds: [1] },
  { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' }
);

export const getFilterInteractiveCountQuery = {
  request: {
    query: GET_INTERACTIVE_MESSAGES_COUNT,
    variables: {
      filter: { tagIds: [1] },
    },
  },
  result: {
    data: {
      countInteractiveTemplates: 3,
    },
  },
};

export const searchInteractive = filterInteractiveFunction({ label: '' }, {});
export const searchInteractiveHi = filterInteractiveFunction({ label: 'hi' }, {});

export const getInteractiveCountQuery = {
  request: {
    query: GET_INTERACTIVE_MESSAGES_COUNT,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countInteractiveTemplates: 4,
    },
  },
};

const quickReplyMock = {
  id: '1',
  interactiveContent:
    '{"type":"quick_reply","options":[{"type":"text","title":"yes"},{"type":"text","title":"no"}],"content":{"type":"text","text":"Glific comes with all new features","header":"Are you excited for *Glific*?"}}',
  label: 'Are you excited for *Glific*?',
  language: {
    id: '1',
    label: 'English',
  },
  translations:
    '{"2":{"type":"quick_reply","options":[{"type":"text","title":"हाँ"},{"type":"text","title":"ना"}],"content":{"type":"text","text":"ग्लिफ़िक सभी नई सुविधाओं के साथ आता है","header":"आप ग्लिफ़िक के लिए कितने उत्साहित हैं?"}},"1":{"type":"quick_reply","options":[{"type":"text","title":"yes"},{"type":"text","title":"no"}],"content":{"type":"text","text":"Glific comes with all new features","header":"Are you excited for *Glific*?"}}}',
  type: 'QUICK_REPLY',
  sendWithTitle: true,
};

const quickReplyMedia = {
  sendWithTitle: true,
  interactiveContent:
    '{"type":"quick_reply","options":[{"type":"text","title":"Visual Arts"},{"type":"text","title":"Poetry"},{"type":"text","title":"Theatre"}],"content":{"url":"https://storage.glific.png","type":"image","text":"What activity would you like?\\n"}}',

  label: 'A quick reply mock',
  type: 'QUICK_REPLY',
  translations:
    '{"1":{"type":"quick_reply","options":[{"type":"text","title":"Visual Arts"},{"type":"text","title":"Poetry"},{"type":"text","title":"Theatre"}],"content":{"url":"https://storage.glific.png","type":"image","text":"What activity would you like?\\n"}}}',

  __typename: 'InteractiveTemplateResult',
  language: {
    id: '1',
    label: 'English',
  },
  tag: {
    id: '1',
    label: 'New Tag',
  },
};

const listReplyMock = {
  type: 'LIST',
  interactiveContent:
    '{"type":"list","title":"new title","body":"😀","globalButtons":[{"type":"text","title":"Section 1"}],"items":[{"title":"title","subtitle":"title","options":[{"type":"text","title":"red","description":"red is color"}]}]}',
  languageId: '2',
  label: 'new title',
  sendWithTitle: false,
  translations:
    '{"2":{"type":"list","title":"new title","body":"😀","globalButtons":[{"type":"text","title":"Section 1"}],"items":[{"title":"title","subtitle":"title","options":[{"type":"text","title":"red","description":"red is color"}]}]}}',
};

const createMockByType = (body: any) => ({
  request: {
    query: CREATE_INTERACTIVE,
    variables: {
      input: body,
    },
  },
  result: {
    data: {
      createInteractiveTemplate: {
        interactiveTemplate: {
          id: '1',
          language: {
            id: '1',
            label: 'English',
          },
          ...body,
        },
        errors: null,
      },
    },
  },
});

const createInteractiveCustomMock = () => ({
  request: {
    query: CREATE_INTERACTIVE,
    variables: {
      input: {
        type: 'LIST',
        interactiveContent:
          '{"type":"list","title":"new title","body":"😀\\n\\n","globalButtons":[{"type":"text","title":"Section 1"}],"items":[{"title":"title","subtitle":"title","options":[{"type":"text","title":"red","description":"red is color"}]}]}',
        languageId: '2',
        label: 'new title',
        sendWithTitle: true,
        tag: null,
        translations:
          '{"2":{"type":"list","title":"new title","body":"😀\\n\\n","globalButtons":[{"type":"text","title":"Section 1"}],"items":[{"title":"title","subtitle":"title","options":[{"type":"text","title":"red","description":"red is color"}]}]}}',
      },
    },
  },
  result: {
    data: {
      createInteractiveTemplate: {
        interactiveTemplate: {
          id: 2,
          language: {
            id: '1',
            label: 'English',
          },
          type: 'LIST',
          interactiveContent:
            '{"type":"list","title":"new title","body":"😀","globalButtons":[{"type":"text","title":"Section 1"}],"items":[{"title":"title","subtitle":"title","options":[{"type":"text","title":"red","description":"red is color"}]}]}',
          languageId: '2',
          label: 'new title',
          sendWithTitle: true,
          translations:
            '{"2":{"type":"list","title":"new title","body":"😀","globalButtons":[{"type":"text","title":"Section 1"}],"items":[{"title":"title","subtitle":"title","options":[{"type":"text","title":"red","description":"red is color"}]}]}}',
        },
        errors: null,
      },
    },
  },
});

const updateMockByType = (response: any, message: any = null) => ({
  request: {
    query: UPDATE_INTERACTIVE,
  },
  result: {
    data: {
      updateInteractiveTemplate: {
        interactiveTemplate: {
          insertedAt: '2021-07-14T11:12:42Z',
          updatedAt: '2021-07-14T11:26:00Z',
          tag: null,
          language: { id: '1', label: 'English' },
          ...response,
        },
        errors: null,
        message,
      },
      errors: null,
    },
  },
  variableMatcher: (variables: any) => true,
});

const getTemplateByType = (id: string, body: any) => ({
  request: {
    query: GET_INTERACTIVE_MESSAGE,
    variables: {
      id,
    },
  },
  result: {
    data: {
      interactiveTemplate: {
        interactiveTemplate: {
          id,
          language: { id: '1', label: 'English' },
          tag: null,
          ...body,
        },
      },
    },
  },
});

const deleteMock = {
  request: {
    query: DELETE_INTERACTIVE,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      deleteInteractiveTemplate: {
        errors: null,
      },
    },
  },
};

const quickReply = {
  type: 'QUICK_REPLY',
  interactiveContent:
    '{"type":"quick_reply","content":{"type":"image","url":"https://storage.glific.png","text":"What activity would you like?\\n"},"options":[{"type":"text","title":"Visual Arts"},{"type":"text","title":"Poetry"},{"type":"text","title":"Theatre"}]}',
  tag_id: '1',
  languageId: '1',
  label: 'A quick reply mock',
  sendWithTitle: true,
  translations:
    '{"1":{"type":"quick_reply","content":{"type":"image","url":"https://storage.glific.png","text":"What activity would you like?\\n"},"options":[{"type":"text","title":"Visual Arts"},{"type":"text","title":"Poetry"},{"type":"text","title":"Theatre"}]}}',
};

const quickReplyResult = {
  ...quickReply,
  language: {
    id: '1',
    label: 'English',
  },
};

export const translateInteractiveTemplateMock = (error: boolean = false) => ({
  request: {
    query: TRANSLATE_INTERACTIVE_TEMPLATE,
    variables: { translateInteractiveTemplateId: '1' },
  },
  [error ? 'error' : 'result']: error
    ? new Error('An error occured')
    : {
        data: {
          translateInteractiveTemplate: {
            interactiveTemplate: { ...quickReplyResult, tag: null, id: '1' },
            errors: null,
            message: null,
          },
        },
      },
});

const trimmingMessage =
  'Trimming has been done for the following languages due to exceeding character limits: Hindi. Please verify the content before saving.';

export const translateInteractiveTemplateWithTrimMock = {
  request: {
    query: TRANSLATE_INTERACTIVE_TEMPLATE,
    variables: { translateInteractiveTemplateId: '1' },
  },
  result: {
    data: {
      translateInteractiveTemplate: {
        interactiveTemplate: { ...quickReplyResult, tag: null, id: '1' },
        errors: null,
        message: trimmingMessage,
      },
    },
  },
};

export const importInteractiveTemplateMock = (error: boolean = false) => ({
  request: {
    query: IMPORT_INTERACTIVE_TEMPLATE,
  },
  [error ? 'error' : 'result']: error
    ? new Error('An error occured')
    : {
        data: {
          importInteractiveTemplate: {
            interactiveTemplate: { ...quickReplyResult, tag: null, id: '1' },
            errors: null,
            message: null,
          },
        },
      },
  variableMatcher: (variables: any) => true,
});

export const importInteractiveTemplateWithTrimmingMock = {
  request: {
    query: IMPORT_INTERACTIVE_TEMPLATE,
  },
  result: {
    data: {
      importInteractiveTemplate: {
        interactiveTemplate: { ...quickReplyResult, tag: null, id: '1' },
        errors: null,
        message: trimmingMessage,
      },
    },
  },
  variableMatcher: (variables: any) => true,
};

export const exportInteractiveTemplateMock = (error: boolean = false) => ({
  request: {
    query: EXPORT_INTERACTIVE_TEMPLATE,
    variables: { exportInteractiveTemplateId: '1', addTranslation: true },
  },
  [error ? 'error' : 'result']: error
    ? new Error('An error occured')
    : {
        data: {
          exportInteractiveTemplate: {
            exportData:
              'Attribute,en,hi\nHeader,test,परीक्षा\nText,test,परीक्षा\nOptionTitle 1,test,परीक्षा\n',
          },
        },
      },
});

export const exportInteractiveTemplateMockWithoutTranslation = (error: boolean = false) => ({
  request: {
    query: EXPORT_INTERACTIVE_TEMPLATE,
    variables: { exportInteractiveTemplateId: '1', addTranslation: false },
  },
  [error ? 'error' : 'result']: error
    ? new Error('An error occured')
    : {
        data: {
          exportInteractiveTemplate: {
            exportData:
              'Attribute,en,hi\nHeader,test,परीक्षा\nText,test,परीक्षा\nOptionTitle 1,test,परीक्षा\n',
          },
        },
      },
});

const quick_reply = {
  type: 'QUICK_REPLY',
  interactiveContent:
    '{"type":"quick_reply","content":{"type":"text","header":"new title","text":"Hi, How are you"},"options":[{"type":"text","title":"new button text"}]}',
  languageId: '1',
  label: 'new title',
  sendWithTitle: false,
  translations:
    '{"1":{"type":"quick_reply","content":{"type":"text","header":"new title","text":"Hi, How are you"},"options":[{"type":"text","title":"new button text"}]}}',
};

export const mocks: any = [
  createMockByType(quickReplyMock),
  createMockByType(listReplyMock),
  createInteractiveCustomMock(),
  createMockByType(quick_reply),
  deleteMock,
  getFilterTagQuery,
  getOrganizationLanguagesWithoutOrder,
];

export const getTemplateMocks1 = [
  ...mocks,
  getTemplateByType('1', quickReplyMock),
  getTemplateByType('1', quickReplyMock),
  updateMockByType(quickReplyMock),
  updateMockByType(quickReplyMock),
  updateMockByType(quickReplyMock),
];

export const getTemplateMocks2 = [
  ...mocks,
  getTemplateByType('2', listReplyMock),
  getTemplateByType('2', listReplyMock),
  updateMockByType(listReplyMock),
];

export const getTemplateMocks3 = [
  ...mocks,
  getTemplateByType('3', quickReplyMedia),
  getTemplateByType('3', quickReplyMedia),
  updateMockByType(quickReplyResult),
];

export const getTemplateMocks4 = [
  ...mocks,
  getTemplateByType('4', quickReplyMock),
  getTemplateByType('4', quickReplyMock),
  updateMockByType(quickReplyMock, trimmingMessage),
];

export const translateWithoutTrimmingMocks = [
  ...getTemplateMocks1,
  translateInteractiveTemplateMock(),
  importInteractiveTemplateMock(),
  exportInteractiveTemplateMock(),
  exportInteractiveTemplateMockWithoutTranslation(),
];

export const translateWitTrimmingMocks = [
  ...getTemplateMocks1,
  translateInteractiveTemplateWithTrimMock,
  importInteractiveTemplateWithTrimmingMock,
];
