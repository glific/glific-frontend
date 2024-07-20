import { setVariables } from 'common/constants';
import { BULK_APPLY_TEMPLATES, IMPORT_TEMPLATES } from 'graphql/mutations/Template';
import { FILTER_TEMPLATES, GET_TEMPLATE, GET_TEMPLATES_COUNT } from 'graphql/queries/Template';
import { searchInteractive, searchInteractiveHi } from './InteractiveMessage';

export const filterTemplatesQuery = (term: any, data: any) => {
  return {
    request: {
      query: FILTER_TEMPLATES,
      variables: setVariables({ term: term }, 50),
    },
    result: {
      data: {
        sessionTemplates: data,
      },
    },
  };
};

export const TEMPLATE_MOCKS = [
  searchInteractive,
  searchInteractiveHi,
  filterTemplatesQuery('', [
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
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
  ]),
  filterTemplatesQuery('', [
    {
      id: '87',
      bspId: null,
      label: 'Good message',
      body: 'Hey there',
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
    {
      id: '94',
      label: 'Message',
      bspId: null,
      body: 'some description',
      shortcode: 'test',
      category: 'ACCOUNT_UPDATE',
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
      MessageMedia: {
        id: 1,
        caption: 'Test',
        sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      },
    },
  ]),

  filterTemplatesQuery('this should not return anything', []),
  filterTemplatesQuery('hi', [
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
  ]),
];

export const templateCountQuery = (isHsm: boolean, count: number = 3) => {
  return {
    request: {
      query: GET_TEMPLATES_COUNT,
      variables: {
        filter: {
          isHsm: isHsm,
        },
      },
    },
    result: {
      data: {
        countSessionTemplates: count,
      },
    },
  };
};

export const hsmTemplatesCountQuery = {
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
      countSessionTemplates: 2,
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
          tag: null,
          translations:
            '{"2":{"uuid":"0de5b294-0385-48d0-bdc0-53cc833a31c5","status":"APPROVED","number_parameters":1,"language_id":2,"label":"Account Balance","example":" अब आप नीचे दिए विकल्पों में से एक का चयन करके [003] के साथ समाप्त होने वाले खाते के लिए अपना खाता शेष या मिनी स्टेटमेंट देख सकते हैं। | [अकाउंट बैलेंस देखें] | [देखें मिनी स्टेटमेंट]","body":" अब आप नीचे दिए विकल्पों में से एक का चयन करके {{1}} के साथ समाप्त होने वाले खाते के लिए अपना खाता शेष या मिनी स्टेटमेंट देख सकते हैं। | [अकाउंट बैलेंस देखें] | [देखें मिनी स्टेटमेंट]"}}',
          type: 'TEXT',
          updatedAt: '2024-03-28T10:41:16Z',
          allowTemplateCategoryChange: true,
          ...buttons,
        },
      },
    },
  },
});
