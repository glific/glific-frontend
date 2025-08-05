import { BULK_APPLY_TEMPLATES, CREATE_TEMPLATE, IMPORT_TEMPLATES, UPDATE_TEMPLATE } from 'graphql/mutations/Template';
import {
  FILTER_SESSION_TEMPLATES,
  FILTER_TEMPLATES,
  GET_HSM_CATEGORIES,
  GET_SHORTCODES,
  GET_SPEED_SEND,
  GET_TEMPLATE,
  GET_TEMPLATES_COUNT,
} from 'graphql/queries/Template';
import { setVariables } from 'common/constants';
import { getOrganizationLanguagesQueryByOrder } from './Organization';
import { getFilterTagQuery } from './Tag';
import { createMediaMessageMock } from './Attachment';
import { searchInteractive, searchInteractiveHi } from './InteractiveMessage';

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

const getCategoriesMock = {
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
};

export const templateEditMock = (templateId: string, buttons: any) => ({
  request: {
    query: GET_TEMPLATE,
    variables: {
      id: templateId,
    },
  },
  result: {
    data: {
      sessionTemplate: {
        __typename: 'SessionTemplateResult',
        sessionTemplate: {
          MessageMedia: null,
          __typename: 'SessionTemplate',
          body: 'You can now view your Account Balance or Mini statement for Account ending with {{1}} simply by selecting one of the options below.',

          category: 'ACCOUNT_UPDATE',
          example:
            'You can now view your Account Balance or Mini statement for Account ending with [003] simply by selecting one of the options below.',
          hasButtons: true,
          id: templateId,
          isActive: true,
          isHsm: true,
          label: 'Account Balance',
          language: {
            __typename: 'Language',
            id: '1',
            label: 'English',
          },
          shortcode: 'account_balance',
          footer: 'Sample footer',
          tag: null,
          translations:
            '{"2":{"uuid":"0de5b294-0385-48d0-bdc0-53cc833a31c5","status":"APPROVED","number_parameters":1,"language_id":2,"label":"Account Balance","example":" अब आप नीचे दिए विकल्पों में से एक का चयन करके [003] के साथ समाप्त होने वाले खाते के लिए अपना खाता शेष या मिनी स्टेटमेंट देख सकते हैं। | [अकाउंट बैलेंस देखें] | [देखें मिनी स्टेटमेंट]","body":" अब आप नीचे दिए विकल्पों में से एक का चयन करके {{1}} के साथ समाप्त होने वाले खाते के लिए अपना खाता शेष या मिनी स्टेटमेंट देख सकते हैं। | [अकाउंट बैलेंस देखें] | [देखें मिनी स्टेटमेंट]"}}',
          type: 'TEXT',
          updatedAt: '2024-03-28T10:41:16Z',

          quality: null,
          ...buttons,
        },
      },
    },
  },
});

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
      footer: 'footer',

      quality: null,
    },
  },
};

const getTemplateDataTypeMedia = {
  sessionTemplate: {
    sessionTemplate: {
      MessageMedia: {
        __typename: 'MessageMedia',
        caption: 'Hi how are you!',
        id: '7619471',
        sourceUrl: 'https://storage.googleapis.com/haqdarshak-bot/images.jpeg',
      },
      __typename: 'SessionTemplate',

      body: 'Hi how are you!',
      buttonType: 'CALL_TO_ACTION',
      buttons:
        '[{"type":"PHONE_NUMBER","text":"Call Us","phone_number":"18008914212"},{"url":"https://play.google.com/store/apps/details?id=com.haqdarshak.jana","type":"URL","text":"App URl"}]',
      category: 'MARKETING',
      example: 'Hi how are you!',
      hasButtons: true,
      id: '5',
      isActive: true,
      isHsm: true,
      label: 'Account Update',
      language: {
        __typename: 'Language',
        id: '1',
        label: 'English',
      },
      quality: 'UNKNOWN',
      shortcode: 'account_update',
      tag: null,
      translations: '{}',
      type: 'IMAGE',
      updatedAt: '2024-07-16T11:22:59Z',
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

export const createTemplateMock = (input: any) => ({
  request: {
    query: CREATE_TEMPLATE,
    variables: {
      input,
    },
  },
  result: {
    data: {
      createSessionTemplate: {
        __typename: 'SessionTemplateResult',
        errors: null,
        sessionTemplate: {
          __typename: 'SessionTemplate',
          id: '1',
          MessageMedia: null,
          buttonType: null,
          buttons: '[]',
          hasButtons: false,
          language: {
            __typename: 'Language',
            id: '1',
            label: 'English',
          },
          category: null,
          shortcode: null,
          example: null,
          translations: '{}',
          ...input,
        },
      },
    },
  },
});

export const templateMock = createTemplateMock({
  label: 'title',
  body: 'Hi, How are you*_~~_* {{1}}',
  footer: 'footer',
  type: 'TEXT',
  category: 'ACCOUNT_UPDATE',
  tagId: '1',
  isActive: true,

  isHsm: true,
  shortcode: 'element_name',
  languageId: '1',
  example: 'Hi, How are you*_~~_* [User]',
  hasButtons: true,
  buttons: '[{"type":"QUICK_REPLY","text":"Call me"}]',

  buttonType: 'QUICK_REPLY',
});

export const quickReplyMock = createTemplateMock({
  label: 'Hello',
  body: 'Hi',
  footer: '',
  type: 'TEXT',
  category: 'ACCOUNT_UPDATE',
  tagId: null,
  isActive: true,

  isHsm: true,
  languageId: '1',
  example: 'Hi',
  shortcode: 'welcome',
  hasButtons: true,
  buttons: '[{"type":"QUICK_REPLY","text":"Yes"},{"type":"QUICK_REPLY","text":"No"}]',
  buttonType: 'QUICK_REPLY',
});

export const ctaMock = createTemplateMock({
  label: 'Hello',
  body: 'Hi',
  footer: '',
  type: 'TEXT',
  category: 'ACCOUNT_UPDATE',
  tagId: null,
  isActive: true,
  isHsm: true,
  languageId: '1',
  example: 'Hi',
  shortcode: 'welcome',
  hasButtons: true,
  buttons: '[{"type":"PHONE_NUMBER","text":"Call me","phone_number":"9876543210"}]',
  buttonType: 'CALL_TO_ACTION',
});

export const createSpeedSend = createTemplateMock({
  label: 'Template',
  body: 'Hi, How are you',
  type: 'IMAGE',
  isActive: true,
  languageId: '1',
  translations:
    '{"1":{"language":{"id":"1","label":"English","localized":true,"locale":"en"},"label":"Template","body":"Hi, How are you","type":"IMAGE","attachmentURL":"https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg","isActive":true,"languageId":"1"}}',
  messageMediaId: 1,
});

export const filterSpeedSends = {
  request: {
    query: FILTER_SESSION_TEMPLATES,
    variables: {
      filter: { isHsm: false },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
  },
  result: {
    data: {
      sessionTemplates: [
        {
          id: '1',
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
          category: null,
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
      ],
    },
  },
};

export const templateCountQuery = (filter: any, count: number = 3) => {
  return {
    request: {
      query: GET_TEMPLATES_COUNT,
      variables: {
        filter,
      },
    },
    result: {
      data: {
        countSessionTemplates: count,
      },
    },
  };
};

export const getSpeedSendTemplate1 = {
  request: {
    query: GET_SPEED_SEND,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      sessionTemplate: {
        __typename: 'SessionTemplateResult',
        sessionTemplate: {
          __typename: 'SessionTemplate',
          body: 'message1',
          id: '30',
          isActive: true,
          label: 'title1',
          language: {
            __typename: 'Language',
            id: '1',
            label: 'English',
          },
          messageMedia: null,
          translations:
            '{"2":{"type":"TEXT","tagId":null,"languageId":"2","language":{"localized":true,"locale":"hi","label":"Hindi","id":"2","__typename":"Language"},"label":"title2","isActive":true,"body":"message2"},"1":{"type":"TEXT","tagId":null,"languageId":"1","language":{"localized":true,"locale":"en","label":"English","id":"1","__typename":"Language"},"label":"title1","isActive":true,"body":"message1"}}',
          type: 'TEXT',
        },
      },
    },
  },
};

export const getSpeedSendTemplate2 = {
  request: {
    query: GET_SPEED_SEND,
    variables: {
      id: '2',
    },
  },
  result: {
    data: {
      sessionTemplate: {
        __typename: 'SessionTemplateResult',
        sessionTemplate: {
          __typename: 'SessionTemplate',
          body: 'sample message',
          id: '2',
          isActive: true,
          label: 'sample title',
          language: {
            __typename: 'Language',
            id: '1',
            label: 'English',
          },
          messageMedia: {
            __typename: 'MessageMedia',
            caption: 'sample message',
            id: '7',
            sourceUrl: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg',
          },
          translations:
            '{"1":{"type":"IMAGE","tagId":null,"languageId":"1","language":{"localized":true,"locale":"en","label":"English","id":"1","__typename":"Language"},"label":"sample title","isActive":true,"body":"sample message","attachmentURL":"https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg"}}',
          type: 'IMAGE',
        },
      },
    },
  },
};

export const updateSessiontemplate = {
  request: {
    query: UPDATE_TEMPLATE,
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
          quality: null,
        },
      },
    },
  },
  variableMatcher: (variables: any) => true,
};

export const templatesData = [
  {
    id: '87',
    bspId: null,
    label: 'Account Balance',
    body: 'Hey there',
    shortcode: 'test',
    category: 'ACCOUNT_UPDATE',
    isReserved: true,
    status: 'APPROVED',
    reason: 'test reason',
    isHsm: true,
    isActive: true,
    updatedAt: '2020-12-01T18:00:32Z',
    numberParameters: 0,
    translations:
      '{"2":{"status":"approved","languageId":{"label":"Hindi","id":"2"},"label":"now","isHsm":false,"body":"hey","MessageMedia":null}}',
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
  {
    id: '94',
    label: 'Good message',
    bspId: null,
    body: 'description',
    shortcode: 'test',
    isReserved: true,
    isHsm: false,
    isActive: true,
    status: null,
    reason: 'test reason',
    updatedAt: '2020-12-01T18:00:32Z',
    numberParameters: 0,
    translations: '{}',
    type: 'TEXT',
    language: {
      id: '1',
      label: 'Hindi',
    },
    category: 'ACCOUNT_UPDATE',
    quality: null,
    MessageMedia: {
      id: 1,
      caption: 'Test',
      sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
    },
  },
  {
    id: '94',
    label: 'Message',
    bspId: null,
    body: 'some description',
    shortcode: 'test',
    isReserved: true,
    isHsm: false,
    isActive: true,
    status: null,
    reason: 'test reason',
    updatedAt: '2020-12-01T18:00:32Z',
    numberParameters: 0,
    translations: '{}',
    type: 'TEXT',
    language: {
      id: '1',
      label: 'Hindi',
    },
    category: 'ACCOUNT_UPDATE',
    quality: null,
    MessageMedia: {
      id: 1,
      caption: 'Test',
      sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
    },
  },
];
export const filterTemplatesQuery = (term: any, data: any, filter?: any) => {
  return {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        ...setVariables({ term: term }, 50),
        ...filter,
      },
    },
    result: {
      data: {
        sessionTemplates: data,
      },
    },
  };
};

export const filterTemplatesMock = (filter: any) => ({
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'label',
      },
      filter,
    },
  },
  result: {
    data: {
      sessionTemplates: templatesData,
    },
  },
});

export const bulkApplyMutation = {
  request: {
    query: BULK_APPLY_TEMPLATES,
    variables: {
      data: 'Language,Title,Message,Sample Message,Element Name,Category,Attachment Type,Attachment URL,Has Buttons,Button Type,CTA Button 1 Type,CTA Button 1 Title,CTA Button 1 Value,CTA Button 2 Type,CTA Button 2 Title,CTA Button 2 Value,Quick Reply 1 Title,Quick Reply 2 Title,Quick Reply 3 Title\nEnglish,Welcome glific,"Hi {{1}}, Welcome to the world","Hi [User], Welcome to the world",welcome_glific,TRANSACTIONAL,,,FALSE,,,,,,,,,,',
    },
  },
  result: {
    data: {
      bulkApplyTemplates: {
        errors: null,
        csv_rows: 'Title,Status\nWelcome Glfic,Template has been applied successfully',
      },
    },
  },
};

export const importTemplateMutation = {
  request: {
    query: IMPORT_TEMPLATES,
    variables: {
      data: '"Template Id","Template Name","Body","Type","Quality Rating","Language","Status","Created On"\n"6344689","common_otp","Your OTP for {{1}} is {{2}}. This is valid for {{3}}.","TEXT","Unknown","English","Enabled","2022-03-10"',
    },
  },
  result: {
    data: {
      importTemplates: {
        errors: null,
        status: 'success',
      },
    },
  },
};

export const importTemplateMutationWithErrors = {
  request: {
    query: IMPORT_TEMPLATES,
    variables: {
      data: '"Template Id","Template Name","Body","Type","Quality Rating","Language","Status","Created On"\n"6344689","common_otp","Your OTP for {{1}} is {{2}}. This is valid for {}}.","TEXT","Unknown","English","Enabled","2022-03-10"',
    },
  },
  result: {
    data: {
      importTemplates: {
        errors: [{ key: 'import', message: 'Invalid format' }],
        status: null,
      },
    },
  },
};

export const HSM_TEMPLATE_MOCKS = [
  getShortCodeQuery,
  getCategoriesMock,
  getFilterTagQuery,
  getOrganizationLanguagesQueryByOrder,
  templateMock,
  quickReplyMock,
  ctaMock,
];

export const SPEED_SENDS_MOCKS = [
  getShortCodeQuery,
  getCategoriesMock,
  getFilterTagQuery,
  getOrganizationLanguagesQueryByOrder,
  createSpeedSend,
  filterSpeedSends,
  filterSpeedSends,
  templateCountQuery({ isHsm: false }, 1),
  templateCountQuery({ isHsm: false }, 1),
  getSpeedSendTemplate1,
  getSpeedSendTemplate1,
  getSpeedSendTemplate2,
  getSpeedSendTemplate2,
  updateSessiontemplate,
  updateSessiontemplate,
  updateSessiontemplate,
  createMediaMessageMock({
    caption: 'Hi, How are you',
    sourceUrl: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg',
    url: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg',
  }),
];

export const HSM_LIST = [
  ...HSM_TEMPLATE_MOCKS,
  filterTemplatesMock({ isHsm: true, status: 'APPROVED' }),
  templateCountQuery({ isHsm: true, status: 'APPROVED' }, 1),
  filterTemplatesMock({ isHsm: true, status: 'APPROVED', tagIds: [1] }),
];

export const SPEED_SEND_LIST = [
  ...SPEED_SENDS_MOCKS,
  filterTemplatesMock({ isHsm: false, status: 'APPROVED' }),
  templateCountQuery({ isHsm: false, status: 'APPROVED' }, 1),
];

const filterQueryMock = filterTemplatesQuery(
  '',
  [
    {
      id: '87',
      bspId: null,
      label: 'Good message',
      body: 'Hey there',
      shortcode: 'test',
      category: 'ACCOUNT_UPDATE',
      isReserved: true,
      status: 'APPROVED',
      reason: 'test reason',
      isHsm: true,
      isActive: true,
      updatedAt: '2020-12-01T18:00:32Z',
      numberParameters: 0,
      translations:
        '{"2":{"status":"approved","languageId":{"label":"Hindi","id":"2"},"label":"now","isHsm":false,"body":"hey","MessageMedia":null}}',
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
    {
      id: '94',
      label: 'Message',
      bspId: null,
      body: 'some description',
      shortcode: 'test',
      isReserved: true,
      isHsm: false,
      isActive: true,
      status: null,
      reason: 'test reason',
      updatedAt: '2020-12-01T18:00:32Z',
      numberParameters: 0,
      translations: '{}',
      type: 'TEXT',
      language: {
        id: '1',
        label: 'Hindi',
      },
      category: 'ACCOUNT_UPDATE',
      quality: null,
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
  ],
  { isHsm: false }
);

const filterQuery = filterTemplatesQuery(
  '',
  [
    {
      id: '87',
      bspId: null,
      label: 'Good message',
      body: 'Hey there',
      shortcode: 'test',
      category: 'ACCOUNT_UPDATE',
      isReserved: true,
      status: 'APPROVED',
      reason: 'test reason',
      isHsm: true,
      isActive: true,
      updatedAt: '2020-12-01T18:00:32Z',
      numberParameters: 0,
      translations:
        '{"2":{"status":"approved","languageId":{"label":"Hindi","id":"2"},"label":"now","isHsm":false,"body":"hey","MessageMedia":null}}',
      type: 'IMAGE',
      quality: null,
      language: {
        id: '1',
        label: 'Hindi',
      },
      MessageMedia: null,
    },
    {
      id: '94',
      label: 'Message',
      bspId: null,
      body: 'some description',
      shortcode: 'test',
      isReserved: true,
      isHsm: false,
      isActive: true,
      status: null,
      reason: 'test reason',
      updatedAt: '2020-12-01T18:00:32Z',
      numberParameters: 0,
      translations: '{}',
      type: 'IMAGE',
      language: {
        id: '1',
        label: 'Hindi',
      },
      category: 'ACCOUNT_UPDATE',
      quality: null,
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
    {
      id: '3',
      label: 'Message',
      bspId: null,
      body: 'some description',
      shortcode: 'test',
      isReserved: true,
      isHsm: true,
      isActive: true,
      status: 'APPROVED',
      reason: 'test reason',
      updatedAt: '2020-12-01T18:00:32Z',
      numberParameters: 0,
      translations: '{}',
      type: 'IMAGE',
      language: {
        id: '1',
        label: 'Hindi',
      },
      category: 'ACCOUNT_UPDATE',
      quality: null,
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
    {
      MessageMedia: null,
      __typename: 'SessionTemplate',
      body: 'You can now view your Account Balance or Mini statement for Account ending with {{1}} simply by selecting one of the options below. ',
      bspId: '0922869a-cd33-4fed-83af-39376d8ccfb5',
      category: 'ACCOUNT_UPDATE',
      id: '11',
      isActive: true,
      isHsm: true,
      isReserved: false,
      label: 'account_statement',
      language: {
        __typename: 'Language',
        id: '1',
        label: 'English',
      },
      numberParameters: 1,
      quality: null,
      reason: null,
      shortcode: 'account_statement',
      status: 'APPROVED',
      translations: '{}',
      type: 'TEXT',
      updatedAt: '2024-10-02T05:02:29Z',
    },
  ],
  { isHsm: true }
);

export const TEMPLATE_MOCKS = [
  searchInteractive,
  searchInteractiveHi,
  filterQueryMock,
  filterQueryMock,
  filterQuery,
  filterQuery,
  filterTemplatesQuery('', []),
  filterTemplatesQuery('this should not return anything', []),
  filterTemplatesQuery(
    'hi',
    [
      {
        id: '87',
        label: 'Good message',
        bspId: null,
        body: 'hi can you help!',
        category: 'ACCOUNT_UPDATE',
        shortcode: 'test',
        isReserved: true,
        isHsm: true,
        isActive: true,
        status: 'APPROVED',
        reason: 'test reason',
        updatedAt: '2020-12-01T18:00:32Z',
        numberParameters: 0,
        translations: '{}',
        type: 'IMAGE',
        quality: null,
        language: {
          id: '1',
          label: 'Hindi',
        },
        MessageMedia: null,
      },
    ],
    { isHsm: true }
  ),
];
