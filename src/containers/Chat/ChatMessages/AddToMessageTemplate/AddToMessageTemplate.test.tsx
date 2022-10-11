import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { SAVE_MESSAGE_TEMPLATE_MUTATION } from 'graphql/mutations/MessageTemplate';
import { TEMPLATE_MOCKS } from 'mocks/Template';
import AddToMessageTemplate from './AddToMessageTemplate';

let resultReturned = false;

const mocks = [
  ...TEMPLATE_MOCKS,
  {
    request: {
      query: SAVE_MESSAGE_TEMPLATE_MUTATION,
      variables: {
        messageId: 1,
        templateInput: { label: 'important', languageId: '2', shortcode: 'important' },
      },
    },
    result() {
      resultReturned = true;
      return {
        data: {
          createTemplateFormMessage: {
            sessionTemplate: {
              id: '1',
              body: 'Hello',
              label: 'important',
            },
          },
        },
      };
    },
  },
];

const defaultProps = {
  id: 1,
  message: 'Hello',
  changeDisplay: () => {},
};

afterEach(cleanup);

const messageTemplate = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <AddToMessageTemplate {...defaultProps} />
  </MockedProvider>
);

test('it should render message template component', () => {
  const { getByTestId } = render(messageTemplate);

  expect(getByTestId('templateContainer')).toBeInTheDocument();
});

test('template should have an input for label', () => {
  const { getByTestId } = render(messageTemplate);

  expect(getByTestId('templateInput')).toBeInTheDocument();
});

test('template should call the query on clicking save button', async () => {
  const { getByTestId } = render(messageTemplate);
  fireEvent.change(getByTestId('templateInput').querySelector('input') as HTMLElement, {
    target: {
      value: 'important',
    },
  });
  fireEvent.click(getByTestId('ok-button'));
  await waitFor(() => {
    expect(resultReturned).toBe(true);
  });
});

test('message should be in the dialogbox', () => {
  const { getByText } = render(messageTemplate);
  expect(getByText('Hello')).toBeInTheDocument();
});

test('it calls the cancel button', () => {
  const { getByTestId } = render(messageTemplate);
  fireEvent.click(getByTestId('cancel-button'));
});

test('error when no input is provided', () => {
  const { getByTestId } = render(messageTemplate);
  fireEvent.click(getByTestId('ok-button'));
  expect(getByTestId('templateInput').querySelector('input')?.getAttribute('aria-invalid')).toBe(
    'true'
  );
});

test('error removed when user inputs a value', () => {
  const { getByTestId } = render(messageTemplate);

  const input = getByTestId('templateInput').querySelector('input') as HTMLElement;
  fireEvent.change(input, {
    target: {
      value: 'important',
    },
  });
  expect(input?.getAttribute('aria-invalid')).toBe('false');
});
