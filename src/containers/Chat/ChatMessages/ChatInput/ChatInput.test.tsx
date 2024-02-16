import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import ChatInput from './ChatInput';
import { TEMPLATE_MOCKS } from 'mocks/Template';
import {
  createMediaMessageMock,
  getAttachmentPermissionMock,
  uploadBlobMock,
} from 'mocks/Attachment';
import { searchInteractive } from 'mocks/InteractiveMessage';
import '../VoiceRecorder/VoiceRecorder';
import { LexicalComposer } from '@lexical/react/LexicalComposer';

const mocks = [
  searchInteractive,
  ...TEMPLATE_MOCKS,
  getAttachmentPermissionMock,
  uploadBlobMock,
  createMediaMessageMock,
];

const blob = () => new Blob();

vi.mock('../VoiceRecorder/VoiceRecorder', () => {
  return {
    VoiceRecorder: ({ handleAudioRecording, clearAudio }: any) => {
      return (
        <div>
          <div
            onClick={() => {
              handleAudioRecording(blob());
            }}
          >
            Record Audio
          </div>
          <div
            onClick={() => {
              clearAudio(true);
            }}
          >
            Clear Audio
          </div>
        </div>
      );
    },
  };
});

describe('<ChatInput />', () => {
  let inputSubmitted = false;
  const onSendMessageHandler = () => {
    inputSubmitted = true;
  };
  const handleHeightChange = vi.fn();

  beforeEach(() => {
    inputSubmitted = false;
  });

  const defaultProps = {
    onSendMessage: onSendMessageHandler,
    handleHeightChange: handleHeightChange,
    contactStatus: 'VALID',
    contactBspStatus: 'SESSION_AND_HSM',
    lastMessageTime: new Date(),
  };

  const chatInput = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <LexicalComposer
        initialConfig={{
          namespace: 'chat-input',
          onError: (error: any) => console.log(error),
        }}
      >
        <ChatInput {...defaultProps} />
      </LexicalComposer>
    </MockedProvider>
  );

  test('it should render the input element', () => {
    const { getByTestId } = render(chatInput);
    expect(getByTestId('message-input-container')).toBeInTheDocument();
  });

  test('speed send, template and interactive buttons should exist', () => {
    const { getAllByTestId } = render(chatInput);
    expect(getAllByTestId('shortcutButton')).toHaveLength(3);
  });

  test('it should not be able to submit without any message', () => {
    const { getByTestId } = render(chatInput);
    fireEvent.click(getByTestId('sendButton'));
    expect(inputSubmitted).toBeFalsy();
  });

  test('chat templates should open when either speed send or templates button is clicked', async () => {
    // Speed sends button
    const { getAllByTestId, getByTestId, queryByTestId } = render(chatInput);
    fireEvent.click(getAllByTestId('shortcutButton')[0]);
    await waitFor(() => {
      expect(getByTestId('chatTemplates')).toBeInTheDocument();
    });
    fireEvent.click(getAllByTestId('shortcutButton')[0]);
    expect(queryByTestId('chatTemplates')).toBe(null);

    // Templates button

    fireEvent.click(getAllByTestId('shortcutButton')[1]);
    await waitFor(() => {
      expect(getByTestId('chatTemplates')).toBeInTheDocument();
    });
    fireEvent.click(getAllByTestId('shortcutButton')[1]);
    expect(queryByTestId('chatTemplates')).toBe(null);
  });

  test('check if reset button works', async () => {
    const { getAllByTestId, getByTestId } = render(chatInput);

    fireEvent.click(getAllByTestId('shortcutButton')[0]);

    await waitFor(() => {
      fireEvent.change(getByTestId('searchInput').querySelector('input') as HTMLElement, {
        target: { value: 'hi' },
      });
    });
    await waitFor(() => {
      fireEvent.click(getByTestId('resetButton'));
    });
  });

  test('Interactive message list should open is interactive msg button is clicked', async () => {
    const { getAllByTestId, getByTestId, queryByTestId } = render(chatInput);
    fireEvent.click(getAllByTestId('shortcutButton')[2]);
    await waitFor(() => {
      expect(getByTestId('chatTemplates')).toBeInTheDocument();
    });
    fireEvent.click(getAllByTestId('shortcutButton')[2]);
    expect(queryByTestId('chatTemplates')).toBe(null);
  });

  test('clicking on a interactive msg from the list should store the value as input', async () => {
    const { getAllByTestId } = render(chatInput);
    const interactiveMessages = getAllByTestId('shortcutButton')[2];
    fireEvent.click(interactiveMessages);
    await waitFor(() => {
      const listItem = getAllByTestId('templateItem')[0];
      fireEvent.click(listItem);
    });
  });

  test.only('send an interactive message', async () => {
    const { getAllByTestId, getByTestId } = render(chatInput);
    const interactiveMessages = getAllByTestId('shortcutButton')[2];
    fireEvent.click(interactiveMessages);
    await waitFor(() => {
      const listItem = getAllByTestId('templateItem')[0];
      console.log('DDD', getAllByTestId('templateItem')[0].outerHTML);

      fireEvent.click(listItem);
    });
    fireEvent.click(getByTestId('sendButton'));
    console.log(inputSubmitted);

    expect(inputSubmitted).toBe(true);
  });

  test('clicking on a speed send from the list should store the value as input', async () => {
    const { getAllByTestId } = render(chatInput);
    const speedSends = getAllByTestId('shortcutButton')[0];
    fireEvent.click(speedSends);
    await waitFor(() => {
      const listItem = getAllByTestId('templateItem')[0];
      fireEvent.click(listItem);
    });
  });

  test('when bsp status is none', async () => {
    const propsWithBspStatusNone = { ...defaultProps };
    propsWithBspStatusNone.contactBspStatus = 'NONE';
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LexicalComposer
          initialConfig={{
            namespace: 'chat-input',
            onError: (error: any) => console.log(error),
          }}
        >
          <ChatInput {...propsWithBspStatusNone} />
        </LexicalComposer>
      </MockedProvider>
    );

    expect(
      getByText(
        'Sorry, chat is unavailable with this contact at this moment because they aren’t opted in to your number.'
      )
    ).toBeInTheDocument();
  });

  test('when bsp status is HSM', async () => {
    const propsWithBspStatusHSM = { ...defaultProps };
    propsWithBspStatusHSM.contactBspStatus = 'HSM';
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LexicalComposer
          initialConfig={{
            namespace: 'chat-input',
            onError: (error: any) => console.log(error),
          }}
        >
          <ChatInput {...propsWithBspStatusHSM} />
        </LexicalComposer>
      </MockedProvider>
    );
    expect(getByText('Templates')).toBeInTheDocument();
  });

  test('when bsp status is SESSION', async () => {
    const propsWithBspStatusSession = { ...defaultProps };
    propsWithBspStatusSession.contactBspStatus = 'SESSION';
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LexicalComposer
          initialConfig={{
            namespace: 'chat-input',
            onError: (error: any) => console.log(error),
          }}
        >
          <ChatInput {...propsWithBspStatusSession} />
        </LexicalComposer>
      </MockedProvider>
    );
    expect(getByText('Speed sends')).toBeInTheDocument();
  });

  test('24 hour window gets over', async () => {
    const propsWithChatWindowOver: any = { ...defaultProps };
    const date = new Date();
    date.setDate(date.getDate() - 2);
    propsWithChatWindowOver.lastMessageTime = date;

    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LexicalComposer
          initialConfig={{
            namespace: 'chat-input',
            onError: (error: any) => console.log(error),
          }}
        >
          <ChatInput {...propsWithChatWindowOver} />
        </LexicalComposer>
      </MockedProvider>
    );
    expect(getByText('Templates')).toBeInTheDocument();
  });

  test('record audio', async () => {
    const propsWithMockSend: any = { ...defaultProps };
    const sendMessageMock = vi.fn();
    propsWithMockSend.onSendMessage = sendMessageMock;
    const { getByText, getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <LexicalComposer
          initialConfig={{
            namespace: 'chat-input',
            onError: (error: any) => console.log(error),
          }}
        >
          <ChatInput {...propsWithMockSend} />
        </LexicalComposer>
      </MockedProvider>
    );

    await waitFor(() => {
      // record audio
      fireEvent.click(getByText('Record Audio'));
    });

    // send audio
    fireEvent.click(getByTestId('sendButton'));

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalled();
    });
  });
});
