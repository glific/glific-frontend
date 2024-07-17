import { GET_LANGUAGES } from 'graphql/queries/List';
import {
  FILTER_TEMPLATES,
  GET_TEMPLATE,
  GET_HSM_CATEGORIES,
  GET_TEMPLATES_COUNT,
  FILTER_SESSION_TEMPLATES,
  GET_SHORTCODES,
} from 'graphql/queries/Template';
import { DELETE_TEMPLATE, CREATE_TEMPLATE, UPDATE_TEMPLATE } from 'graphql/mutations/Template';
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
    quality: null,
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
    quality: 'high',
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
    quality: null,
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
          quality: null,
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

const getTemplateDataTypeText = {
  sessionTemplate: {
    sessionTemplate: {
      id: '1',
      body: 'You can now view your Account Balance or Mini statement for Account ending with {{1}} simply by selecting one of the options below.',
      label: 'Account Balance',
      isHsm: true,
      updatedAt: '2024-06-25T12:25:27Z',
      translations:
        '{"1":{"uuid":"cc584565-8d3a-4d64-838a-4601578189f4","status":"APPROVED","number_parameters":1,"language_id":2,"label":"Account Balance","example":" अब आप नीचे दिए विकल्पों में से एक का चयन करके [003] के साथ समाप्त होने वाले खाते के लिए अपना खाता शेष या मिनी स्टेटमेंट देख सकते हैं। | [अकाउंट बैलेंस देखें] | [देखें मिनी स्टेटमेंट]","body":" अब आप नीचे दिए विकल्पों में से एक का चयन करके {{1}} के साथ समाप्त होने वाले खाते के लिए अपना खाता शेष या मिनी स्टेटमेंट देख सकते हैं। | [अकाउंट बैलेंस देखें] | [देखें मिनी स्टेटमेंट]"}}',
      type: 'TEXT',
      language: {
        __typename: 'Language',
        id: '1',
        label: 'English',
      },
      isActive: true,
      MessageMedia: null,
      tag: {
        id: '1',
        label: 'Messages',
      },
      category: 'ACCOUNT_UPDATE',
      shortcode: 'account_balance',
      example:
        'You can now view your Account Balance or Mini statement for Account ending with [003] simply by selecting one of the options below.',
      hasButtons: true,
      buttons:
        '[{"type":"QUICK_REPLY","text":"View Account Balance"},{"type":"QUICK_REPLY","text":"View Mini Statement"}]',
      buttonType: 'QUICK_REPLY',
      allowTemplateCategoryChange: false,
    },
  },
};

const getTemplateDataTypeMedia = {
  sessionTemplate: {
    sessionTemplate: {
      MessageMedia: null,
      body: 'Hi {{1}},\n\nYour account image was updated on {{2}} by {{3}} with above.  | [Visit Website,https://www.gupshup.io/developer/[message]]',
      buttonType: null,
      buttons: '[]',
      category: 'UTILITY',
      example:
        'Hi [Anil],\n\nYour account image was updated on [19th December] by [Saurav] with above.  | [Visit Website,https://www.gupshup.io/developer/[message]]',
      hasButtons: false,
      id: '5',
      isActive: false,
      isHsm: true,
      label: 'Account Update',
      language: {
        __typename: 'Language',
        id: '1',
        label: 'English',
      },
      shortcode: 'account_update',
      tag: null,
      translations:
        '{"2":{"number_parameters":3,"language_id":2,"body":"हाय {{1}},  n  n आपके खाते की छवि {{2}} पर {{3}} द्वारा अद्यतन की गई थी।"}}',
      type: 'IMAGE',
      updatedAt: '2024-07-03T08:17:28Z',
      allowTemplateCategoryChange: true,
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
        example: 'Hi [Glific], How are you',
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
        allowTemplateCategoryChange: false,
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
          allowTemplateCategoryChange: false,
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
        allowTemplateCategoryChange: false,
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
          allowTemplateCategoryChange: false,
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
        type: 'IMAGE',
        shortcode: 'welcome',
        example: 'Hi [Glific], How are you',
        category: 'ACCOUNT_UPDATE',
        tagId: null,
        isActive: true,
        isHsm: true,
        languageId: '1',
        translations: '{}',
        messageMediaId: 5,
        allowTemplateCategoryChange: true,
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
          allowTemplateCategoryChange: true,
        },
        errors: null,
      },
    },
  },
};

const createMediaMessage = {
  request: {
    query: CREATE_MEDIA_MESSAGE,
    variables: {
      input: {
        caption: 'Hi {{1}}, How are you',
        sourceUrl: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg',
        url: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg',
      },
    },
  },
  result: {
    data: {
      createMessageMedia: {
        __typename: 'MessageMediaResult',
        messageMedia: {
          __typename: 'MessageMedia',
          id: '5',
        },
      },
    },
  },
};

const getShortCodeQuery = {
  request: {
    query: GET_SHORTCODES,
    variables: { filter: { isHsm: true } },
  },
  result: {
    data: {
      sessionTemplates: [
        {
          __typename: 'SessionTemplate',
          shortcode: 'account_balance',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: 'movie_ticket',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: 'movie_ticket',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: 'personalized_bill',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: 'account_update',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: 'bill',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: '',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: '',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: 'otp',
        },
        {
          __typename: 'SessionTemplate',
          shortcode: 'user-registration',
        },
      ],
    },
  },
};

export const getHSMTemplateTypeText = {
  request: {
    query: GET_TEMPLATE,
    variables: {
      id: '1',
    },
  },
  result: {
    data: getTemplateDataTypeText,
  },
};

export const getHSMTemplateTypeMedia = {
  request: {
    query: GET_TEMPLATE,
    variables: {
      id: '1',
    },
  },
  result: {
    data: getTemplateDataTypeMedia,
  },
};

export const getSpendSendTemplate = {
  request: {
    query: GET_TEMPLATE,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      sessionTemplate: {
        sessionTemplate: {
          MessageMedia: {
            __typename: 'MessageMedia',
            caption: 'message',
            id: '5',
            sourceUrl:
              'https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630',
          },
          __typename: 'SessionTemplate',
          allowTemplateCategoryChange: true,
          body: 'message',
          buttonType: null,
          buttons: '[]',
          category: null,
          example: null,
          hasButtons: false,
          id: '11',
          isActive: true,
          isHsm: false,
          label: 'title',
          language: {
            id: '1',
            label: 'English',
          },
          shortcode: null,
          tag: null,
          translations:
            '{"2":{"status":"approved","languageId":{"localized":true,"locale":"hi","label":"Hindi","id":"2","__typename":"Language"},"label":"hey","isHsm":false,"body":"hindi translations","MessageMedia":null}}',
          type: 'IMAGE',
          updatedAt: '2024-07-10T09:43:25Z',
        },
      },
    },
  },
};

export const updateSessiontemplate = {
  request: {
    query: UPDATE_TEMPLATE,
    variables: {
      id: '1',
      input: {
        translations:
          '{"2":{"status":"approved","languageId":{"localized":true,"locale":"hi","label":"Hindi","id":"2","__typename":"Language"},"label":"hey","isHsm":false,"body":"hindi translations","MessageMedia":null},"undefined":{"status":"approved","languageId":null,"label":"title","body":"message","MessageMedia":{"type":"IMAGE","sourceUrl":"https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630"},"isHsm":false}}',
      },
    },
  },
  result: {
    data: {
      updateSessionTemplate: {
        __typename: 'SessionTemplateResult',
        sessionTemplate: {
          MessageMedia: {
            __typename: 'MessageMedia',
            caption: 'message',
            id: '5',
            sourceUrl:
              'https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630',
          },
          __typename: 'SessionTemplate',
          allowTemplateCategoryChange: true,
          body: 'message',
          buttonType: null,
          buttons: '[]',
          category: null,
          example: null,
          hasButtons: false,
          id: '11',
          isActive: true,
          label: 'title',
          language: {
            __typename: 'Language',
            id: '1',
            label: 'English',
          },
          shortcode: null,
          translations:
            '{"2":{"status":"approved","languageId":{"localized":true,"locale":"hi","label":"Hindi","id":"2","__typename":"Language"},"label":"hey","isHsm":false,"body":"hindi translations","MessageMedia":null}}',
          type: 'IMAGE',
        },
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
  createMediaMessage,
  getShortCodeQuery,
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
  getSpendSendTemplate,
  updateSessiontemplate,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
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
  quality: null,
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

const getTemplatesCount = {
  request: {
    query: GET_TEMPLATES_COUNT,
    variables: { filter: { isHsm: false } },
  },
  result: {
    data: {
      countSessionTemplates: 3,
    },
  },
};

export const SPEED_SENDS_MOCKS = [
  getSpendSendTemplate,
  getSpendSendTemplate,
  getSpendSendTemplate,
  speedSendOrderWith,
  speedSendOrderWith,
  speedSend,
  speedSend,
  filterTemplateQuery,
  getTemplatesCount,
  getTemplatesCount,
  updateSessiontemplate,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQueryByOrder,
  getOrganizationLanguagesQueryByOrder,
  getOrganizationLanguagesQueryByOrder,
  getFilterTagQuery,
  getFilterTagQuery,
  getFilterTagQuery,
  updateSessiontemplate,
];
