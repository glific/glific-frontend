import { GET_LANGUAGES } from 'graphql/queries/List';
import {
  FILTER_TEMPLATES,
  GET_TEMPLATE,
  GET_HSM_CATEGORIES,
  GET_TEMPLATES_COUNT,
  FILTER_SESSION_TEMPLATES,
} from 'graphql/queries/Template';
import { DELETE_TEMPLATE, CREATE_TEMPLATE } from 'graphql/mutations/Template';
import {
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQueryByOrder,
  getOrganizationQuery,
} from 'mocks/Organization';
import { templateCountQuery } from 'mocks/Template';
import { CREATE_MEDIA_MESSAGE } from 'graphql/mutations/Chat';
import { getFilterTagQuery } from 'mocks/Tag';

const count = templateCountQuery(false, 2);

const requestFilterTemplates = {
  query: FILTER_TEMPLATES,
  variables: {
    filter: { label: 'new Template', languageId: 1 },
    opts: { order: 'ASC', limit: null, offset: 0 },
  },
};
const SpeedSendsSessionTemplates = [
  {
    id: '87',
    body: 'Hey There',
    label: 'Good message',
    shortcode: 'test',
    status: 'ACCEPTED',
    reason: 'test reason',
    isHsm: false,
    isReserved: false,
    isActive: false,
    updatedAt: '2020-12-01T18:00:28Z',
    numberParameters: 0,
    translations:
      '{"2":{"status":"approved","languageId":{"localized":true,"locale":"hi","label":"Hindi","id":"2","__typename":"Language"},"label":"आप ग्लिफ़िक के लिए कितने उत्साहित हैं?","isHsm":false,"body":"यह संदेश है\\n","MessageMedia":null}}',
    type: 'TEXT',
    language: {
      id: '1',
      label: 'English',
    },
    MessageMedia: {
      id: 1,
      caption: 'Test',
      sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
    },
  },
];

const speedSend = {
  request: {
    query: FILTER_SESSION_TEMPLATES,
    variables: {
      filter: { isHsm: false },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
  },
  result: {
    data: {
      sessionTemplates: SpeedSendsSessionTemplates,
    },
  },
};

const speedSendOrderWith = {
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: { isHsm: false },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
  },
  result: {
    data: {
      sessionTemplates: SpeedSendsSessionTemplates,
    },
  },
};

const HSMTemplateCount = templateCountQuery(true, 2);

const HSMSessionTemplates = [
  {
    id: '98',
    body: 'This is HSM template',
    label: 'Good message',
    shortcode: 'test',
    isHsm: true,
    isReserved: false,
    translations: '{}',
    type: 'TEXT',
    numberParameters: 2,
    language: {
      id: '1',
      label: 'Hindi',
    },
    MessageMedia: {
      id: 1,
      caption: 'Test',
      sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
    },
  },
];

const HSMTemplate = {
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: {
        isHsm: true,
      },

      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
      },
    },
  },
  result: {
    data: {
      sessionTemplates: HSMSessionTemplates,
    },
  },
};

const sessionTemplates = [
  {
    id: '87',
    body: 'Hi',
    label: 'Hello',
    shortcode: 'test',
    isHsm: false,
    isReserved: false,
    translations: '{}',
    type: 'TEXT',
    language: {
      id: '1',
      label: 'Hindi',
    },
    MessageMedia: {
      id: 1,
      caption: 'Test',
      sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
    },
  },
];

const filterByBody = (body: string) => ({
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: {
        body: body,
      },
      opts: {
        order: 'ASC',
      },
    },
  },
  result: {
    data: {
      sessionTemplates,
    },
  },
});

const speedSendValidation = {
  request: {
    query: FILTER_TEMPLATES,
    variables: requestFilterTemplates,
  },
  result: {
    data: {
      sessionTemplates: HSMSessionTemplates,
    },
  },
};

const filterTemplateQuery = {
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: { label: '', isHsm: false },
      opts: { order: 'ASC', limit: 50, offset: 0 },
    },
  },
  result: {
    data: {
      sessionTemplates: [
        {
          id: '98',
          body: 'This is HSM template',
          label: 'new Template',
          isHsm: true,
          isReserved: false,
          updatedAt: '2020-12-01T18:00:32Z',
          translations: '{}',
        },
      ],
    },
  },
};

export const whatsappHsmCategories = [
  {
    request: {
      query: GET_HSM_CATEGORIES,
      variables: {},
    },
    result: {
      data: {
        whatsappHsmCategories: [
          'ACCOUNT_UPDATE',
          'PAYMENT_UPDATE',
          'PERSONAL_FINANCE_UPDATE',
          'SHIPPING_UPDATE',
          'RESERVATION_UPDATE',
          'ISSUE_RESOLUTION',
          'APPOINTMENT_UPDATE',
          'TRANSPORTATION_UPDATE',
          'TICKET_UPDATE',
          'ALERT_UPDATE',
          'AUTO_REPLY',
        ],
      },
    },
  },
];

const getTemplateData = {
  sessionTemplate: {
    sessionTemplate: {
      id: '1',
      label: 'important',
      body: 'important template',
      example: 'important template',
      category: null,
      shortcode: 'important template',
      isActive: true,
      translations: '{}',
      type: 'TEXT',
      isHsm: false,
      language: {
        id: '1',
        label: 'English',
      },
      MessageMedia: null,
      hasButtons: false,
      buttons: null,
      buttonType: null,
      updatedAt: '2020-12-01T18:00:32Z',
      tag: null,
    },
  },
};

const createHsmWithButtontemplate = {
  request: {
    query: CREATE_TEMPLATE,
    variables: {
      input: {
        label: 'Hello',
        body: 'Hi {{1}}, How are you',
        type: 'TEXT',
        shortcode: 'welcome',
        example: 'Hi [[Glific], How are you',
        category: 'ACCOUNT_UPDATE',
        tagId: null,
        isActive: true,
        isHsm: true,
        languageId: '1',
        hasButtons: true,
        buttons:
          '[{"type":"QUICK_REPLY","text":"Quick reply 1"},{"type":"QUICK_REPLY","text":"Quick reply 2"}]',
        buttonType: 'QUICK_REPLY',
        translations: '{}',
      },
    },
  },
  result: {
    data: {
      createSessionTemplate: {
        sessionTemplate: {
          id: '1',
          label: 'Hello',
          body: 'Hi {{1}}, How are you',
          type: 'TEXT',
          shortcode: 'welcome',
          isActive: true,
          MessageMedia: null,
          language: {
            label: 'English',
            id: '1',
          },
          translations: '{}',
          category: 'ACCOUNT_UPDATE',
          example: 'Hi [Glific], How are you',
          hasButtons: true,
          buttons:
            '[{"type":"QUICK_REPLY","text":"Quick reply 1"},{"type":"QUICK_REPLY","text":"Quick reply 2"}]',
          buttonType: 'QUICK_REPLY',
        },
        errors: null,
      },
    },
  },
};

const createHsmWithPhonetemplate = {
  request: {
    query: CREATE_TEMPLATE,
    variables: {
      input: {
        label: 'Hello',
        body: 'Hi {{1}}, How are you',
        type: 'TEXT',
        shortcode: 'welcome',
        example: 'Hi [[Glific], How are you',
        category: 'ACCOUNT_UPDATE',
        tagId: null,
        isActive: true,
        isHsm: true,
        languageId: '1',
        hasButtons: true,
        buttons: '[{"type":"PHONE_NUMBER","text":"Call me","phone_number":"9876543210"}]',
        buttonType: 'CALL_TO_ACTION',
        translations: '{}',
      },
    },
  },
  result: {
    data: {
      createSessionTemplate: {
        sessionTemplate: {
          id: '1',
          label: 'Hello',
          body: 'Hi {{1}}, How are you',
          type: 'TEXT',
          shortcode: 'welcome',
          isActive: true,
          MessageMedia: null,
          language: {
            label: 'English',
            id: '1',
          },
          translations: '{}',
          category: 'ACCOUNT_UPDATE',
          example: 'Hi [Glific], How are you',
          hasButtons: true,
          buttons: '[{"type":"PHONE_NUMBER","text":"Call me","phone_number":"9876543210"}]',
          buttonType: 'CALL_TO_ACTION',
        },
        errors: null,
      },
    },
  },
};

const createHSMtemplate = {
  request: {
    query: CREATE_TEMPLATE,
    variables: {
      input: {
        label: 'Hello',
        body: 'Hi {{1}}, How are you',
        type: 'TEXT',
        shortcode: 'welcome',
        example: 'Hi [Glific], How are you',
        category: 'ACCOUNT_UPDATE',
        tagId: null,
        isActive: true,
        isHsm: true,
        languageId: '1',
        translations: '{}',
      },
    },
  },
  result: {
    data: {
      createSessionTemplate: {
        sessionTemplate: {
          id: '1',
          label: 'Hello',
          body: 'Hi {{1}}, How are you',
          type: 'TEXT',
          shortcode: 'welcome',
          isActive: true,
          MessageMedia: null,
          language: {
            label: 'English',
            id: '1',
          },
          translations: '{}',
          category: 'ACCOUNT_UPDATE',
          example: 'Hi [Glific], How are you',
          hasButtons: false,
          buttons: null,
          buttonType: null,
        },
        errors: null,
      },
    },
  },
};

export const TEMPLATE_MOCKS = [
  getFilterTagQuery,
  createHSMtemplate,
  getFilterTagQuery,
  createHsmWithButtontemplate,
  createHsmWithPhonetemplate,
  {
    request: {
      query: CREATE_TEMPLATE,
      variables: {
        input: {
          body: 'new Template body',
          label: 'new Template',
          languageId: 1,
          type: 'TEXT',
        },
      },
    },
    result: {
      data: {
        createSessionTemplate: {
          sessionTemplate: {
            body: 'new Template body',
            id: '121',
            label: 'new Template',
          },
        },
      },
    },
  },
  {
    request: {
      query: CREATE_MEDIA_MESSAGE,
      variables: {
        input: { caption: 'hey', sourceUrl: 'https://glific.com', url: 'https://glific.com' },
      },
    },
    result: {
      data: {
        createMessageMedia: {
          messageMedia: {
            id: '121',
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_TEMPLATE,
      variables: {
        id: '1',
      },
    },
    result: {
      data: getTemplateData,
    },
  },
  {
    request: {
      query: GET_TEMPLATE,
      variables: {
        id: '1',
      },
    },
    result: {
      data: getTemplateData,
    },
  },
  {
    request: {
      query: DELETE_TEMPLATE,
      variables: {
        id: '87',
      },
    },
    result: {
      data: {
        deleteSessionTemplate: {
          errors: null,
        },
      },
    },
  },
  {
    request: {
      query: GET_LANGUAGES,
    },
    result: {
      data: {
        languages: [
          {
            id: '1',
            label: 'English (United States)',
          },
          {
            id: '2',
            label: 'Hindi (India)',
          },
        ],
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: requestFilterTemplates,
    },
    result: {
      data: {
        sessionTemplates: HSMSessionTemplates,
      },
    },
  },
  filterTemplateQuery,
  filterTemplateQuery,
  count,
  count,
  speedSend,
  speedSend,
  HSMTemplateCount,
  HSMTemplate,
  filterByBody('hi'),
  filterByBody(''),
  speedSendValidation,
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQueryByOrder,
  ...whatsappHsmCategories,
  speedSendOrderWith,
  speedSendOrderWith,
];

const getHSMTemplate = (id: string, status: string) => ({
  MessageMedia: null,
  body: 'You can now view your Account Balance or Mini statement for Account ending with {{1}} simply by selecting one of the options below.',
  id,
  bspId: null,
  isActive: true,
  isHsm: true,
  isReserved: false,
  label: 'Account Balance',
  language: { id: '1', label: 'English' },
  shortcode: 'account_balance',
  status,
  reason: 'test reason',
  translations:
    '{"2":{"number_parameters":1,"language_id":2,"body":" अब आप नीचे दिए विकल्पों में से एक का चयन करके {{1}} के साथ समाप्त होने वाले खाते के लिए अपना खाता शेष या मिनी स्टेटमेंट देख सकते हैं। | [अकाउंट बैलेंस देखें] | [देखें मिनी स्टेटमेंट]"}}',
  type: 'TEXT',
  numberParameters: 2,
  updatedAt: '2021-07-28T08:00:24Z',
});

export const HSM_LIST = [
  {
    request: {
      query: GET_TEMPLATES_COUNT,
      variables: {
        filter: {
          isHsm: true,
          status: 'APPROVED',
        },
      },
    },
    result: {
      data: {
        countSessionTemplates: 3,
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: { isHsm: true },
        opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
      },
    },
    result: {
      data: {
        sessionTemplates: [
          getHSMTemplate('1', 'APPROVED'),
          getHSMTemplate('2', 'PENDING'),
          getHSMTemplate('3', 'REJECTED'),
        ],
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: { isHsm: true, status: 'APPROVED' },
        opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
      },
    },
    result: {
      data: {
        sessionTemplates: [
          getHSMTemplate('1', 'APPROVED'),
          getHSMTemplate('2', 'APPROVED'),
          getHSMTemplate('3', 'APPROVED'),
        ],
      },
    },
  },
  {
    request: {
      query: GET_TEMPLATES_COUNT,
      variables: {
        filter: {
          isHsm: true,
          status: 'REJECTED',
        },
      },
    },
    result: {
      data: {
        countSessionTemplates: 1,
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: { isHsm: true, status: 'REJECTED' },
        opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
      },
    },
    result: {
      data: {
        sessionTemplates: [getHSMTemplate('1', 'REJECTED')],
      },
    },
  },
];
