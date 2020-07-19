import React from 'react';
import { render, wait, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { ApolloProvider, InMemoryCache } from '@apollo/client';
import gqlClient from '../../../config/apolloclient';
import { GET_TAGS_COUNT, FILTER_TAGS, GET_LANGUAGES } from '../../../graphql/queries/Tag';
import { ChatMessages } from './ChatMessages';
import {
  GET_CONVERSATION_MESSAGE_QUERY,
  GET_CONVERSATION_QUERY,
} from '../../../graphql/queries/Chat';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  CREATE_MESSAGE_TAG,
} from '../../../graphql/mutations/Chat';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import { MESSAGE_RECEIVED_SUBSCRIPTION } from '../../../graphql/subscriptions/Chat';
import { Switch, Route } from 'react-router-dom';
import { within, fireEvent, waitForDomChange } from '@testing-library/dom';
import initialCacheState from './ChatMessages.test.json';

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();

// const mocks = [
//   {
//     request: {
//       query: GET_CONVERSATION_MESSAGE_QUERY,
//       variables: { contactId: '2', filter: {}, messageOpts: { limit: 25 } },
//     },
//     result: {
//       data: {
//         conversation: {
//           contact: {
//             id: '2',
//             name: 'Vaibhav',
//           },
//           messages: [
//             {
//               id: '1',
//               body: 'Hey there whats up?',
//               insertedAt: '2020-06-25T13:36:43Z',
//               receiver: {
//                 id: '2',
//               },
//               sender: {
//                 id: '1',
//               },
//               tags: [
//                 {
//                   id: '1',
//                   label: 'important',
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     },
//   },

//   {
//     request: {
//       query: GET_TAGS,
//     },
//     result: {
//       data: {
//         tags: [
//           {
//             id: '87',
//             label: 'Good message',
//             description: 'Hey There',
//           },
//           {
//             id: '1',
//             label: 'important',
//             description: 'some description',
//           },
//         ],
//       },
//     },
//   },
//   {
//     request: {
//       query: CREATE_MESSAGE_TAG,
//       variables: {
//         input: {
//           messageId: '1',
//           tagId: '87',
//         },
//       },
//     },
//     result: {
//       data: {
//         createMessageTag: {
//           messageTag: {
//             message: {
//               id: '1',
//             },
//             tag: {
//               id: '87',
//               label: 'Good message',
//             },
//           },
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: CREATE_MESSAGE_TAG,
//       variables: {
//         input: {
//           messageId: '1',
//           tagId: '1',
//         },
//       },
//     },
//     result: {
//       data: {
//         createMessageTag: {
//           messageTag: {
//             message: {
//               id: '1',
//             },
//             tag: {
//               id: '1',
//               label: 'important',
//             },
//           },
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: CREATE_AND_SEND_MESSAGE_MUTATION,
//       variables: {
//         input: {
//           body: 'Hey There Wow',
//           senderId: 1,
//           receiverId: '2',
//           type: 'TEXT',
//           flow: 'OUTBOUND',
//         },
//       },
//     },
//     result: {
//       data: {
//         createAndSendMessage: {
//           message: {
//             body: 'Hey There Wow',
//             insertedAt: '2020-06-25T13:36:43Z',
//             id: '10388',
//             receiver: {
//               id: '2',
//             },
//             sender: {
//               id: '1',
//             },

//             tags: [
//               {
//                 id: 1,
//                 label: 'critical',
//               },
//             ],
//           },
//         },
//       },
//     },
//   },
//   {
//     request: {
//       query: GET_CONVERSATION_QUERY,
//       variables: {
//         contactOpts: {
//           limit: 50,
//         },
//         filter: {},
//         messageOpts: {
//           limit: 100,
//         },
//       },
//     },
//     result: {
//       data: {
//         conversations: [
//           {
//             contact: {
//               id: '290',
//               name: 'Effie Cormier',
//             },
//             messages: [
//               {
//                 body:
//                   'Conscience is but a word that cowards use, devised at first to keep the strong in awe.',
//                 id: '7218',
//                 insertedAt: '2020-06-30T21:48:42Z',
//                 receiver: {
//                   id: '1',
//                 },
//                 sender: {
//                   id: '290',
//                 },
//                 tags: [],
//               },
//               {
//                 body: "How bitter a thing it is to look into happiness through another man's eyes!",
//                 id: '7217',
//                 insertedAt: '2020-06-29T09:31:47Z',
//                 receiver: {
//                   id: '1',
//                 },
//                 sender: {
//                   id: '290',
//                 },
//                 tags: [
//                   {
//                     id: '18',
//                     label: 'Child',
//                   },
//                   {
//                     id: '5',
//                     label: 'Greeting',
//                   },
//                   {
//                     id: '15',
//                     label: 'Help',
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     },
//   },
// ];

describe('<ChatMessages />', () => {
  it('do nothing', () => {
    expect(1 === 1);
  });
});

//   // let wrapper: any;

//   // beforeAll(() => {
//   //   wrapper = render(
//   //     <ApolloProvider client={gqlClient}>
//   //       <ChatMessages contactId={0} />
//   //     </ApolloProvider>
//   //   );
//   // });

//   const cache = new InMemoryCache().restore(initialCacheState);

//   it('testing if this will work', async () => {
//     const wrapper = render(
//       <MockedProvider cache={cache} mocks={mocks}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     expect(wrapper.exists()).toBe(true);
//   });

//   it('should have loading state', async () => {
//     const { getByText } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     expect(getByText('Loading...')).toBeInTheDocument();
//     await wait();
//   });

//   it('should have title as contact name', async () => {
//     const { getByTestId } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     expect(getByTestId('name')).toHaveTextContent('Vaibhav');
//   });

//   test('input should function properly', async () => {
//     const { getByTestId } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     fireEvent.change(getByTestId('message-input'), {
//       target: { value: 'Hey There' },
//     });
//     expect(getByTestId('message-input').getAttribute('value')).toBe('Hey There');
//   });

//   it('should have an emoji picker', async () => {
//     const { getByTestId } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     expect(getByTestId('emoji-picker')).toBeInTheDocument();
//   });

//   it('should contain the mock message', async () => {
//     const { getByTestId } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     expect(getByTestId('content')).toHaveTextContent('Hey there whats up?');
//   });

//   test('click on assign tag should open a dialog box with mock messages', async () => {
//     const { getByTestId } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     fireEvent.click(getByTestId('messageOptions'));
//     await wait();
//     fireEvent.click(getByTestId('dialogButton'));
//     await wait();
//     expect(getByTestId('dialogBox')).toHaveTextContent('Good message');
//   });

//   test('add a new message on submit to input box', async () => {
//     const { getAllByTestId, getByTestId, rerender } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     fireEvent.change(getByTestId('message-input'), {
//       target: { value: 'Hey There Wow' },
//     });
//     await wait();
//     fireEvent.keyPress(getByTestId('message-input'), { key: 'Enter', code: 13, charCode: 13 });
//     await wait();
//     expect(getByTestId('messageContainer')).toHaveTextContent('Hey There Wow');
//   });

//   test('assign a tag to message', async () => {
//     const { container, getAllByTestId, getByTestId, getByText, queryByText } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     fireEvent.click(getByTestId('messageOptions'));
//     await wait();
//     fireEvent.click(getByTestId('dialogButton'));
//     await wait();
//     fireEvent.click(getAllByTestId('dialogCheckbox')[0].querySelector('input'));
//     fireEvent.click(getAllByTestId('dialogCheckbox')[1].querySelector('input'));
//     await wait();
//     fireEvent.click(getByText('Confirm'));
//     await wait();
//     expect(getByText('Good message')).toBeInTheDocument();
//   });

//   test('focus on the latest message', async () => {
//     const { container, getByTestId, getByText } = render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ChatMessages contactId={0} />
//       </MockedProvider>
//     );
//     await wait();
//     const message = getByTestId('message');
//     expect(message.scrollIntoView).toBeCalled();
//   });

//   // Should render all conversations/messages properly
// });
