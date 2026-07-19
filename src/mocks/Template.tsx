import {
  BULK_APPLY_TEMPLATES,
  CREATE_TEMPLATE,
  DELETE_TEMPLATE,
  IMPORT_TEMPLATES,
  SYNC_HSM_TEMPLATES,
  UPDATE_TEMPLATE,
} from 'graphql/mutations/Template';
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

export const getCategoriesMock = {
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

export const deleteTemplateMock = (id: string) => ({
  request: { query: DELETE_TEMPLATE, variables: { id } },
  result: { data: { deleteSessionTemplate: { errors: null } } },
});

export const deleteTemplateErrorMock = (id: string, message: string) => ({
  request: { query: DELETE_TEMPLATE, variables: { id } },
  error: new Error(message),
});

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
export const CREATE_SESSION_TEMPLATE_MOCK = [
  {
    request: {
      query: CREATE_TEMPLATE,
    },
    result: () => ({
      data: {
        createSessionTemplate: {
          sessionTemplate: {
            id: '101',
            label: 'title',
            body: 'Hi, How are you*_~~_* {{1}}',
            footer: 'footer',
            isActive: true,
            language: {
              id: '1',
              label: 'English',
            },
            translations: [],
            type: 'TEXT',
            MessageMedia: null,
            category: 'ACCOUNT_UPDATE',
            shortcode: 'element_name',
            example: 'Hi, How are you*_~~_* [User]',
            hasButtons: true,
            buttons: JSON.stringify([
              {
                type: 'FLOW',
                navigate_screen: 'RECOMMEND',
                text: 'Continue',
                flow_id: '1473834353902269',
                flow_action: 'NAVIGATE',
              },
            ]),
            buttonType: 'WHATSAPP_FORM',
          },
          errors: null,
        },
      },
    }),
    maxUsageCount: Number.POSITIVE_INFINITY,
    variableMatcher: () => true,
  },
];

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

export const dynamicUrlMock = createTemplateMock({
  label: 'Hello',
  body: 'Hi',
  type: 'TEXT',
  category: 'ACCOUNT_UPDATE',
  tagId: null,
  isActive: true,
  allowTemplateCategoryChange: true,
  isHsm: true,
  shortcode: 'welcome',
  languageId: '2',
  example: 'Hi',
  hasButtons: true,
  buttons:
    '[{"type":"URL","text":"Click me","url":"https://example.com/{{1}}","example":["https://example.com/example"]}]',
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

export const templateCountQuery = (filter: any, count: number) => {
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
    id: '1',
    bspId: null,
    label: 'Test Template',
    body: 'Test body',
    shortcode: 'test',
    category: 'ACCOUNT_UPDATE',
    isReserved: false,
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
    hasButtons: false,
    buttonType: null,
    buttons: null,
  },
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
    hasButtons: false,
    buttonType: null,
    buttons: null,
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
    hasButtons: false,
    buttonType: null,
    buttons: null,
  },
  {
    id: '95',
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
    hasButtons: false,
    buttonType: null,
    buttons: null,
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
      data: 'Language,Title,Message,Sample Message,Element Name,Category,Attachment Type,Attachment URL,Has Buttons,Button Type,CTA Button 1 Type,CTA Button 1 Title,CTA Button 1 Value,CTA Button 2 Type,CTA Button 2 Title,CTA Button 2 Value,Quick Reply 1 Title,Quick Reply 2 Title,Quick Reply 3 Title\r\nEnglish,Welcome Arogya,"Hi {{1}},\nWelcome to the world","Hi [Akhilesh],\nWelcome to the world",bulk_hsm_welcome,UTILITY,,,FALSE,,,,,,,,,,\r\nEnglish,Signup,"Hi {{1}},\nSignup Here","Hi [Akhilesh],\nSignup Here",bulk_hsm_signup,UTILITY,,,TRUE,QUICK_REPLY,,,,,,,Yes,No,\r\nEnglish,Help,"Hi {{1}},\nNeed help?","Hi [Akhilesh],\nNeed help?",bulk_hsm_help,UTILITY,,,TRUE,CALL_TO_ACTION,Phone Number,Call here,8979120220,URL,Visit Here,https://github.com/glific,,,\r\nEnglish,Activity,"Hi {{1}},\nLook at this image.","Hi [Akhilesh],\nLook at this image.",bulk_hsm_activity,UTILITY,image,https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg,FALSE,,,,,,,,,,',
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

export const bulkApplyMutationWIthError = {
  request: {
    query: BULK_APPLY_TEMPLATES,
    variables: {
      data: 'file content',
    },
  },
  error: new Error('Invalid format'),
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
  dynamicUrlMock,
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

export const hsmV2TemplatesData = [
  {
    id: '1',
    bspId: 'bsp-001',
    label: 'Welcome Message',
    body: 'Hi {{1}}, welcome!',
    footer: 'Reply STOP to opt out',
    shortcode: 'welcome_msg',
    category: 'UTILITY',
    isReserved: false,
    status: 'APPROVED',
    reason: null,
    isHsm: true,
    isActive: true,
    updatedAt: '2024-01-15T10:00:00Z',
    numberParameters: 1,
    // HSM templates come back flat per-language; the list groups them by
    // shortcode, so the Hindi sibling below shares this `welcome_msg` shortcode.
    translations: null,
    type: 'TEXT',
    quality: 'HIGH',
    language: { id: '1', label: 'English', locale: 'en' },
    tag: { id: '1', label: 'Messages' },
    MessageMedia: null,
    hasButtons: true,
    buttonType: 'CALL_TO_ACTION',
    buttons: JSON.stringify([
      { type: 'URL', text: 'Get started', url: 'https://example.com' },
      { type: 'QUICK_REPLY', text: 'Learn more' },
      { type: 'PHONE_NUMBER', text: 'Call us', phone_number: '9876543210' },
    ]),
  },
  {
    id: '3',
    bspId: null,
    label: 'Feedback Form',
    body: 'Please share your feedback.',
    footer: null,
    shortcode: 'feedback_form',
    category: 'MARKETING',
    isReserved: false,
    status: 'REJECTED',
    reason: 'Content policy violation',
    isHsm: true,
    isActive: false,
    updatedAt: '2024-01-10T08:00:00Z',
    numberParameters: 0,
    translations: null,
    type: 'TEXT',
    quality: null,
    language: { id: '1', label: 'English', locale: 'en' },
    tag: null,
    MessageMedia: { id: 1, caption: 'Order summary', sourceUrl: 'https://example.com/order-summary.jpg' },
    hasButtons: false,
    buttonType: null,
    // deliberately malformed — exercises the JSON.parse catch branch in the
    // hover preview, which should render with no buttons rather than crash.
    buttons: '[{"type":"QUICK_REPLY","text":"Oops"',
  },
  {
    // Hindi variant of the Welcome Message — shares the `welcome_msg` shortcode,
    // so it collapses under the English row's expand chevron.
    id: '2',
    bspId: 'bsp-002',
    label: 'Welcome Message',
    body: 'Namaste {{1}}, swagat hai!',
    footer: null,
    shortcode: 'welcome_msg',
    category: 'UTILITY',
    isReserved: false,
    status: 'APPROVED',
    reason: null,
    isHsm: true,
    isActive: true,
    updatedAt: '2024-01-15T10:00:00Z',
    numberParameters: 1,
    translations: null,
    type: 'TEXT',
    quality: 'HIGH',
    language: { id: '2', label: 'Hindi', locale: 'hi' },
    tag: { id: '1', label: 'Messages' },
    MessageMedia: null,
    hasButtons: false,
    buttonType: null,
    buttons: null,
  },
  {
    // Marathi variant (PENDING) — exercises the pending chip styling/tooltip.
    id: '4',
    bspId: 'bsp-004',
    label: 'Welcome Message',
    body: 'Namaskar {{1}}, swagat aahe!',
    footer: null,
    shortcode: 'welcome_msg',
    category: 'UTILITY',
    isReserved: false,
    status: 'PENDING',
    reason: null,
    isHsm: true,
    isActive: true,
    updatedAt: '2024-01-15T10:00:00Z',
    numberParameters: 1,
    translations: null,
    type: 'TEXT',
    quality: null,
    language: { id: '3', label: 'Marathi', locale: 'mr' },
    tag: { id: '1', label: 'Messages' },
    MessageMedia: null,
    hasButtons: false,
    buttonType: null,
    buttons: null,
  },
  {
    // Tamil variant (FAILED) — exercises the failed chip styling/tooltip.
    id: '5',
    bspId: 'bsp-005',
    label: 'Welcome Message',
    body: 'Vanakkam {{1}}!',
    footer: null,
    shortcode: 'welcome_msg',
    category: 'UTILITY',
    isReserved: false,
    status: 'FAILED',
    reason: null,
    isHsm: true,
    isActive: true,
    updatedAt: '2024-01-15T10:00:00Z',
    numberParameters: 1,
    translations: null,
    type: 'TEXT',
    quality: null,
    language: { id: '4', label: 'Tamil', locale: 'ta' },
    tag: { id: '1', label: 'Messages' },
    MessageMedia: null,
    hasButtons: false,
    buttonType: null,
    buttons: null,
  },
];

// HSMListV2 drives the shared `List` component, so mocks must mirror the exact
// variables List sends: filter + opts {limit:50, offset:0, order:'ASC', orderWith:'label'}.
export const sessionTemplatesV2Mock = (filter: any, data: any) => ({
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter,
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
  },
  result: { data: { sessionTemplates: data } },
});

export const sessionTemplatesV2ErrorMock = (filter: any, message: string) => ({
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter,
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
  },
  error: new Error(message),
});

// HSMListV2 defaults the status filter to APPROVED, so every list query carries
// `status: 'APPROVED'` alongside the other filters.
export const filterTemplatesV2Mock = sessionTemplatesV2Mock({ isHsm: true, status: 'APPROVED' }, hsmV2TemplatesData);
export const filterTemplatesV2CategoryMock = sessionTemplatesV2Mock(
  { isHsm: true, status: 'APPROVED', category: 'UTILITY' },
  [hsmV2TemplatesData[0]]
);
export const filterTemplatesV2TagMock = sessionTemplatesV2Mock({ isHsm: true, status: 'APPROVED', tagIds: [1] }, [
  hsmV2TemplatesData[0],
]);
export const filterTemplatesV2SearchMock = sessionTemplatesV2Mock(
  { isHsm: true, status: 'APPROVED', label: 'feedback' },
  [hsmV2TemplatesData[1]]
);
export const filterTemplatesV2RejectedMock = sessionTemplatesV2Mock({ isHsm: true, status: 'REJECTED' }, [
  hsmV2TemplatesData[1],
]);
// covers the title falling back to the label when a template has no shortcode yet.
export const noShortcodeTemplateData = {
  id: '7',
  bspId: null,
  label: 'No Shortcode Yet',
  body: 'Draft body.',
  footer: null,
  shortcode: '',
  category: 'UTILITY',
  isReserved: false,
  status: 'APPROVED',
  reason: null,
  isHsm: true,
  isActive: true,
  updatedAt: '2024-04-01T00:00:00Z',
  numberParameters: 0,
  translations: null,
  type: 'TEXT',
  quality: null,
  language: { id: '1', label: 'English', locale: 'en' },
  tag: null,
  MessageMedia: null,
  hasButtons: false,
  buttonType: null,
  // valid JSON, but not an array — parsePreviewButtons should treat it as no buttons.
  buttons: '{"type":"URL","text":"oops"}',
};
export const filterTemplatesV2NoShortcodeMock = sessionTemplatesV2Mock(
  { isHsm: true, status: 'APPROVED', label: 'draft' },
  [noShortcodeTemplateData]
);

export const allStatusesTemplatesData = [
  {
    id: '6',
    bspId: 'bsp-006',
    label: 'Pending Broadcast',
    body: 'This one is still pending approval.',
    footer: null,
    shortcode: 'pending_broadcast',
    category: 'MARKETING',
    isReserved: false,
    status: 'PENDING',
    reason: null,
    isHsm: true,
    isActive: true,
    updatedAt: '2024-03-01T00:00:00Z',
    numberParameters: 0,
    translations: null,
    type: 'TEXT',
    quality: null,
    language: { id: '1', label: 'English', locale: 'en' },
    tag: null,
    MessageMedia: null,
    hasButtons: false,
    buttonType: null,
    buttons: null,
  },
];
export const filterTemplatesV2AllStatusesMock = sessionTemplatesV2Mock({ isHsm: true }, allStatusesTemplatesData);

export const templateCountV2Mock = templateCountQuery({ isHsm: true, status: 'APPROVED' }, hsmV2TemplatesData.length);
export const templateCountV2RejectedMock = templateCountQuery({ isHsm: true, status: 'REJECTED' }, 1);
export const templateCountV2AllStatusesMock = templateCountQuery({ isHsm: true }, allStatusesTemplatesData.length);
export const templateCountV2CategoryMock = templateCountQuery(
  { isHsm: true, status: 'APPROVED', category: 'UTILITY' },
  1
);
export const templateCountV2TagMock = templateCountQuery({ isHsm: true, status: 'APPROVED', tagIds: [1] }, 1);
export const templateCountV2SearchMock = templateCountQuery({ isHsm: true, status: 'APPROVED', label: 'feedback' }, 1);
export const templateCountV2NoShortcodeMock = templateCountQuery(
  { isHsm: true, status: 'APPROVED', label: 'draft' },
  1
);

export const getCategoriesV2Mock = {
  request: { query: GET_HSM_CATEGORIES, variables: {} },
  result: { data: { whatsappHsmCategories: ['UTILITY', 'MARKETING'] } },
};

export const HSM_LIST_V2 = [
  filterTemplatesV2Mock,
  filterTemplatesV2Mock,
  filterTemplatesV2Mock,
  templateCountV2Mock,
  templateCountV2Mock,
  templateCountV2Mock,
  getCategoriesV2Mock,
  getCategoriesV2Mock,
  getCategoriesV2Mock,
];

// Template library modal: browses only APPROVED HSM templates via FILTER_TEMPLATES.
export const libraryTemplatesData = [
  {
    ...hsmV2TemplatesData[0],
    footer: 'Team Glific',
  },
  {
    id: '5',
    bspId: 'bsp-005',
    label: 'Appointment Reminder',
    body: 'Your appointment is on {{1}}.',
    footer: null,
    shortcode: 'appointment_reminder',
    category: 'UTILITY',
    isReserved: false,
    status: 'APPROVED',
    reason: null,
    isHsm: true,
    isActive: true,
    updatedAt: '2024-02-01T09:00:00Z',
    numberParameters: 1,
    translations: null,
    type: 'TEXT',
    quality: 'HIGH',
    language: { id: '1', label: 'English', locale: 'en' },
    tag: { id: '1', label: 'Messages' },
    MessageMedia: null,
    hasButtons: false,
    buttonType: null,
    buttons: null,
  },
];

export const libraryTemplatesMock = sessionTemplatesV2Mock({ isHsm: true, status: 'APPROVED' }, libraryTemplatesData);
export const libraryTemplatesSearchMock = sessionTemplatesV2Mock(
  { isHsm: true, status: 'APPROVED', term: 'appointment' },
  [libraryTemplatesData[1]]
);

export const TEMPLATE_LIBRARY_MOCKS = [
  libraryTemplatesMock,
  libraryTemplatesMock,
  getCategoriesV2Mock,
  getCategoriesV2Mock,
];

export const syncHsmSuccessMock = {
  request: { query: SYNC_HSM_TEMPLATES },
  result: { data: { syncHsmTemplate: { errors: null, message: 'success' } } },
};

export const syncHsmErrorMock = {
  request: { query: SYNC_HSM_TEMPLATES },
  result: { data: { syncHsmTemplate: null } },
};

export const bulkApplyV2Mock = {
  request: {
    query: BULK_APPLY_TEMPLATES,
    variables: { data: 'csv content' },
  },
  result: {
    data: { bulkApplyTemplates: { errors: null, csv_rows: 'Title,Status\nTest,Success' } },
  },
};

export const syncHsmNetworkErrorMock = {
  request: { query: SYNC_HSM_TEMPLATES },
  error: new Error('Network error'),
};

export const bulkApplyV2ErrorsMock = {
  request: {
    query: BULK_APPLY_TEMPLATES,
    variables: { data: 'csv content' },
  },
  result: {
    data: {
      bulkApplyTemplates: {
        errors: [{ key: 'row_2', message: 'Invalid template' }],
        csv_rows: 'Title,Status\nTest,Failed',
      },
    },
  },
};

export const bulkApplyV2NetworkErrorMock = {
  request: {
    query: BULK_APPLY_TEMPLATES,
    variables: { data: 'csv content' },
  },
  error: new Error('Network error'),
};

export const bulkApplyV2EmptyMock = {
  request: {
    query: BULK_APPLY_TEMPLATES,
    variables: { data: 'csv content' },
  },
  result: {
    data: { bulkApplyTemplates: null },
  },
};

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
