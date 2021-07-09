import {
  FILTER_INTERACTIVE_MESSAGES,
  GET_INTERACTIVE_MESSAGES_COUNT,
} from '../graphql/queries/InteractiveMessage';

export const filterInteractiveQuery = {
  request: {
    query: FILTER_INTERACTIVE_MESSAGES,
    variables: {
      filter: {},
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'label',
      },
    },
  },
  result: {
    data: {
      interactives: [
        {
          id: '1',
          label: 'list',
          type: 'LIST',
          interactiveContent:
            '{"type":"list","title":"Glific","items":[{"title":"Glific Features","subtitle":"first Subtitle","options":[{"type":"text","title":"Custom flows for automating conversation","description":"Flow Editor for creating flows"},{"type":"text","title":"Custom reports for  analytics","description":"DataStudio for report generation"},{"type":"text","title":"ML/AI","description":"Dialogflow for AI/ML"}]},{"title":"Glific Usecases","subtitle":"some usecases of Glific","options":[{"type":"text","title":"Educational programs","description":"Sharing education content with school student"}]},{"title":"Onboarded NGOs","subtitle":"List of NGOs onboarded","options":[{"type":"text","title":"SOL","description":"Slam Out Loud is an Indian for mission, non-profit that envisions that every individual will have a voice that empowers them to change lives."}]}],"globalButtons":[{"type":"text","title":"button text"}],"body":"Glific"}',
        },
        {
          id: '2',
          label: 'quick reply document',
          type: 'QUICK_REPLY',
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"First"},{"type":"text","title":"Second"},{"type":"text","title":"Third"}],"content":{"url":"http://enterprise.smsgupshup.com/doc/GatewayAPIDoc.pdf","type":"file","filename":"Sample file"}}',
        },
        {
          id: '3',
          label: 'quick reply image',
          type: 'QUICK_REPLY',
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"First"},{"type":"text","title":"Second"},{"type":"text","title":"Third"}],"content":{"url":"https://picsum.photos/200/300","type":"image","caption":"body text"}}',
        },
        {
          id: '4',
          label: 'quick reply image',
          type: 'QUICK_REPLY',
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"Excited"},{"type":"text","title":"Very Excited"}],"content":{"type":"text","text":"How excited are you for Glific?"}}',
        },
      ],
    },
  },
};

export const getInteractiveCountQuery = {
  request: {
    query: GET_INTERACTIVE_MESSAGES_COUNT,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countInteractives: 4,
    },
  },
};
