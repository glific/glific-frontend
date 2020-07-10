import React from 'react';
import AddToMessageTemplate from './AddToMessageTemplate';
import { render, wait, within, fireEvent, screen, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';

let resultReturned = false;

const mocks = [
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

describe('<AddToMessageTemplate />', () => {
  const defaultProps = {
    id: 1,
    message: 'Hello',
    changeDisplay: () => {},
  };

  afterEach(cleanup);

  test('it should render message template component', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddToMessageTemplate {...defaultProps} />
      </MockedProvider>
    );

    expect(getByTestId('templateContainer')).toBeInTheDocument();
  });

  test('template should have an input for label', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddToMessageTemplate {...defaultProps} />
      </MockedProvider>
    );

    expect(getByTestId('templateInput')).toBeInTheDocument();
  });

  test('template should call the query on clicking save button', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddToMessageTemplate {...defaultProps} />
      </MockedProvider>
    );
    fireEvent.change(getByTestId('templateInput').querySelector('input'), {
      target: {
        value: 'important',
      },
    });
    fireEvent.click(getByTestId('ok-button'));
    await wait();
    expect(resultReturned).toBe(true);
  });

  test('message should be in the dialogbox', () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddToMessageTemplate {...defaultProps} />
      </MockedProvider>
    );
    expect(getByText('Hello')).toBeInTheDocument();
  });

  test('it calls the cancel button', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddToMessageTemplate {...defaultProps} />
      </MockedProvider>
    );
    fireEvent.click(getByTestId('cancel-button'));
  });

  test('error when no input is provided', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddToMessageTemplate {...defaultProps} />
      </MockedProvider>
    );
    fireEvent.click(getByTestId('ok-button'));
    expect(getByTestId('templateInput').querySelector('input')?.getAttribute('aria-invalid')).toBe(
      'true'
    );
  });

  test('error removed when user inputs a value', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AddToMessageTemplate {...defaultProps} />
      </MockedProvider>
    );

    const input = getByTestId('templateInput').querySelector('input');
    fireEvent.click(getByTestId('ok-button'));
    fireEvent.change(input, {
      target: {
        value: 'important',
      },
    });
    expect(input?.getAttribute('aria-invalid')).toBe('false');
  });
});
