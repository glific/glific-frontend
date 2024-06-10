import {
  CREATE_INTERACTIVE,
  DELETE_INTERACTIVE,
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
            __typename: 'Language',
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
  sendWithTitle: false,
  interactiveContent:
    '{"type":"quick_reply","options":[{"type":"text","title":"Yes"},{"type":"text","title":"No"}],"content":{"type":"text","text":"Do you want to continue?","header":"Continue"}}',
  label: 'Continue',
  translations:
    '{"1":{"type":"quick_reply","options":[{"type":"text","title":"Yes"},{"type":"text","title":"No"}],"content":{"type":"text","text":"Do you want to continue?","header":"Continue"}}}',
  type: 'QUICK_REPLY',
  language: {
    id: '1',
    label: 'English',
  },
  tag: {
    id: '1',
    label: 'New tag',
  },
};

const quickReplyMockInput = {
  type: 'QUICK_REPLY',
  interactiveContent:
    '{"type":"quick_reply","content":{"type":"text","header":"Continue","text":"Do you want to continue?"},"options":[{"type":"text","title":"Yes"},{"type":"text","title":"No"}]}',
  tag_id: '1',
  languageId: '1',
  label: 'Continue',
  sendWithTitle: false,
  translations:
    '{"1":{"type":"quick_reply","content":{"type":"text","header":"Continue","text":"Do you want to continue?"},"options":[{"type":"text","title":"Yes"},{"type":"text","title":"No"}]}}',
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
  sendWithTitle: false,
  tag: {
    id: '1',
    label: 'New tag',
  },
  label: 'list',
  type: 'LIST',
  translations: '{}',
  language: {
    id: '1',
    label: 'English',
  },
  interactiveContent:
    '{"type":"list","title":"Glific","items":[{"title":"Glific Features","subtitle":"first Subtitle","options":[{"type":"text","title":"Custom flows for automating conversation","description":"Flow Editor for creating flows"},{"type":"text","title":"Custom reports for  analytics","description":"DataStudio for report generation"},{"type":"text","title":"ML/AI","description":"Dialogflow for AI/ML"}]},{"title":"Glific Usecases","subtitle":"some usecases of Glific","options":[{"type":"text","title":"Educational programs","description":"Sharing education content with school student"}]},{"title":"Onboarded NGOs","subtitle":"List of NGOs onboarded","options":[{"type":"text","title":"SOL","description":"Slam Out Loud is an Indian for mission, non-profit that envisions that every individual will have a voice that empowers them to change lives."}]}],"globalButtons":[{"type":"text","title":"button text"}],"body":"Glific"}',
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
        interactiveTemplate: body,
      },
      errors: null,
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

const updateMockByType = (id: string, input: any, response: any) => ({
  request: {
    query: UPDATE_INTERACTIVE,
    variables: {
      id,
      input,
    },
  },
  result: {
    data: {
      updateInteractiveTemplate: {
        interactiveTemplate: {
          id,
          insertedAt: '2021-07-14T11:12:42Z',
          updatedAt: '2021-07-14T11:26:00Z',
          ...response,
        },
        errors: null,
      },
      errors: null,
    },
  },
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

export const mocks: any = [
  createMockByType(quickReplyMock),
  createMockByType(listReplyMock),
  createInteractiveCustomMock(),
  updateMockByType('1', quickReplyMockInput, quickReplyMock),
  updateMockByType('2', listReplyMock, listReplyMock),
  getTemplateByType('1', quickReplyMock),
  getTemplateByType('2', listReplyMock),
  getTemplateByType('3', quickReplyMedia),
  deleteMock,
  getFilterTagQuery,
  getOrganizationLanguagesWithoutOrder,
];
