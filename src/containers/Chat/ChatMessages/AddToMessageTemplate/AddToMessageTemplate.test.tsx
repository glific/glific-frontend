import React from 'react';
import AddToMessageTemplate from './AddToMessageTemplate';
import { render, wait, within, fireEvent, screen, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';

const mocks = [
  {
    request: {
      query: SAVE_MESSAGE_TEMPLATE_MUTATION,
      variables: {
        messageId: 1,
        input: { label: 'important', languageId: '1', shortcode: 'Get' },
      },
    },
    result: {
      data: {
        createTemplateFormMessage: {
          sessionTemplate: {
            id: '1',
            body: 'Hello',
            label: 'important',
          },
        },
      },
    },
  },
];

describe('<AddToMessageTemplate />', () => {
  const defaultProps = {
    id: 1,
    message: 'Hello',
    changeDisplay: () => {},
  };

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
});
