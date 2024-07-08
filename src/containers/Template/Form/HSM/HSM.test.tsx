import 'mocks/matchMediaMock';
import { render, waitFor, within, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as Notification from 'common/notification';
import { HSM } from './HSM';
import { TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';

const mocks = TEMPLATE_MOCKS;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Edit mode', () => {
  test('HSM form is loaded correctly in edit mode', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/templates/1/edit']}>
          <Routes>
            <Route path="/templates/:id/edit" element={<HSM />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByText('Edit HSM Template')).toBeInTheDocument();
    });
  });
});

describe('Add mode', () => {
  const template = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <HSM />
      </MemoryRouter>
    </MockedProvider>
  );
  const user = userEvent.setup();

  test('check for validations for the HSM form', async () => {
    const { getByText, container } = render(template);
    await waitFor(() => {
      expect(getByText('Add a new HSM Template')).toBeInTheDocument();
    });

    const { queryByText } = within(container.querySelector('form') as HTMLElement);
    fireEvent.click(screen.getByTestId('submitActionButton'));

    // we should have 2 errors
    await waitFor(() => {
      expect(queryByText('Title is required.')).toBeInTheDocument();
      expect(queryByText('Message is required.')).toBeInTheDocument();
    });

    fireEvent.change(container.querySelector('input[name="label"]') as HTMLInputElement, {
      target: {
        value:
          'We are not allowing a really long title, and we should trigger validation for this.',
      },
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    // we should still have 2 errors
    await waitFor(() => {
      expect(queryByText('Title length is too long.')).toBeInTheDocument();
      expect(queryByText('Message is required.')).toBeInTheDocument();
    });
  });

  test('it should create a template message', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    render(template);

    await waitFor(() => {
      expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
        'English'
      );
    });

    const title = screen.getAllByTestId('input')[0].querySelector('input') as HTMLInputElement;
    const elementName = document.querySelector('input[name="shortcode"]') as HTMLInputElement;
    const attachmentUrl = document.querySelector('input[name="attachmentURL"]') as HTMLInputElement;
    const message = screen.getByTestId('editor-body') as HTMLElement;
    const sampleMessage = screen.getByTestId('editor-example') as HTMLElement;

    await user.type(title, 'Hello');

    await user.type(elementName, 'welcome');

    // add message
    await user.click(message);
    await user.tab();
    fireEvent.input(message, { data: 'Hi {{1}}, How are you' });

    // add Sample message
    await user.click(sampleMessage);
    await user.tab();
    fireEvent.input(sampleMessage, { data: 'Hi [Glific], How are you' });

    const [_language, category, attachmentType] = screen.getAllByTestId('autocomplete-element');
    category.focus();
    fireEvent.keyDown(category, { key: 'ArrowDown' });
    fireEvent.keyDown(category, { key: 'ArrowDown' });
    fireEvent.keyDown(category, { key: 'Enter' });

    fireEvent.click(screen.getByText('Allow meta to re-categorize template?'));

    attachmentType.focus();
    fireEvent.keyDown(attachmentType, { key: 'ArrowDown' });
    fireEvent.keyDown(attachmentType, { key: 'ArrowDown' });
    fireEvent.keyDown(attachmentType, { key: 'Enter' });

    await user.type(
      attachmentUrl,
      'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg'
    );

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  }, 10000);

  test('it should check sample and body', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
        'English'
      );
    });

    const title = screen.getAllByTestId('input')[0].querySelector('input') as HTMLInputElement;
    const elementName = document.querySelector('input[name="shortcode"]') as HTMLInputElement;
    const message = screen.getByTestId('editor-body') as HTMLElement;
    const sampleMessage = screen.getByTestId('editor-example') as HTMLElement;

    await user.type(title, 'Hello');

    await user.type(elementName, 'welcome');

    // add message
    await user.click(message);
    await user.tab();
    fireEvent.input(message, { data: 'Hi {{1}}, How are you' });

    // add Sample message
    await user.click(sampleMessage);
    await user.tab();
    fireEvent.input(sampleMessage, { data: 'Hi Glific, How are you' });

    // save template
    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      // expect an error
      expect(
        screen.getByText(
          'Message and sample look different. You have to replace variables eg. {{1}} with actual values enclosed in [ ] eg. Replace {{1}} with [Monica].'
        )
      ).toBeInTheDocument();
    });
  });

  test('add quick reply buttons when adding a template', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    render(template);

    await waitFor(() => {
      const language = screen.getAllByTestId('AutocompleteInput')[0].querySelector('input');
      expect(language).toHaveValue('English');
    });

    const title = screen.getAllByTestId('input')[0].querySelector('input') as HTMLInputElement;
    const elementName = document.querySelector('input[name="shortcode"]') as HTMLInputElement;
    const message = screen.getByTestId('editor-body') as HTMLElement;
    const sampleMessage = screen.getByTestId('editor-example') as HTMLElement;

    await user.type(title, 'Hello');
    await user.type(elementName, 'welcome');

    // add message
    await user.click(message);
    await user.tab();
    fireEvent.input(message, { data: 'Hi {{1}}, How are you' });

    // add Sample message
    await user.click(sampleMessage);
    await user.tab();
    fireEvent.input(sampleMessage, { data: 'Hi [Glific], How are you' });

    await user.click(screen.getAllByTestId('checkboxLabel')[1]);
    await user.click(screen.getByText('Quick replies'));
    await user.click(screen.getByTestId('addButton'));

    const quickReply1 = screen
      .getAllByTestId('quickReplyWrapper')[0]
      .querySelector('input') as HTMLInputElement;
    const quickReply2 = screen
      .getAllByTestId('quickReplyWrapper')[1]
      .querySelector('input') as HTMLInputElement;

    await user.type(quickReply1, 'Quick reply 1');
    fireEvent.blur(quickReply1);
    await user.type(quickReply2, 'Quick reply 2');
    fireEvent.blur(quickReply2);

    // update category
    const [_language, category] = screen.getAllByTestId('autocomplete-element');
    category.focus();
    fireEvent.keyDown(category, { key: 'ArrowDown' });
    fireEvent.keyDown(category, { key: 'ArrowDown' });
    fireEvent.keyDown(category, { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('add quick reply buttons with call to action', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    render(template);

    await waitFor(() => {
      const language = screen.getAllByTestId('AutocompleteInput')[0].querySelector('input');
      expect(language).toHaveValue('English');
    });

    const title = screen.getAllByTestId('input')[0].querySelector('input') as HTMLInputElement;
    const elementName = document.querySelector('input[name="shortcode"]') as HTMLInputElement;
    const message = screen.getByTestId('editor-body') as HTMLElement;
    const sampleMessage = screen.getByTestId('editor-example') as HTMLElement;

    await user.type(title, 'Hello');
    await user.type(elementName, 'welcome');

    // add message
    await user.click(message);
    await user.tab();
    fireEvent.input(message, { data: 'Hi {{1}}, How are you' });

    // add Sample message
    await user.click(sampleMessage);
    await user.tab();
    fireEvent.input(sampleMessage, { data: 'Hi [[Glific], How are you' });

    await user.click(screen.getAllByTestId('checkboxLabel')[1]);
    await user.click(screen.getByText('Call to actions'));
    await user.click(screen.getByText('Phone number'));

    const quickReply1 = screen
      .getByTestId('buttonTitle')
      .querySelector('input') as HTMLInputElement;
    const quickReply2 = screen
      .getByTestId('buttonValue')
      .querySelector('input') as HTMLInputElement;

    await user.type(quickReply1, 'Call me');
    fireEvent.blur(quickReply1);
    await user.type(quickReply2, '9876543210');
    fireEvent.blur(quickReply2);

    // update category
    const [_language, category] = screen.getAllByTestId('autocomplete-element');
    category.focus();
    fireEvent.keyDown(category, { key: 'ArrowDown' });
    fireEvent.keyDown(category, { key: 'ArrowDown' });
    fireEvent.keyDown(category, { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});
