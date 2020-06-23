import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_LANGUAGES, GET_TAG } from '../../graphql/queries/Tag';
import { Tag } from './Tag';

const mocks = [
  {
    request: {
      query: GET_LANGUAGES,
    },
    result: {
      data: {
        languages: [
          {
            id: '1',
            label: 'English (United States)',
          },
          {
            id: '2',
            label: 'Hindi (India)',
          },
        ],
      },
    },
  },

  {
    request: {
      query: GET_TAG,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        tag: {
          tag: {
            id: 1,
            label: 'important',
            description: 'important label',
            isActive: true,
            isReserved: false,
            language: {
              id: 1,
            },
          },
        },
      },
    },
  },
];

describe('<Tag />', () => {
  it('should have a form', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: null } }} />
        </Router>
      </MockedProvider>
    );

    await wait();

    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should have a form with inputs', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: null } }} />
        </Router>
      </MockedProvider>
    );

    await wait();

    expect(container.querySelector('input[name="label"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="description"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="isReserved"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="isActive"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="languageId"]')).toBeInTheDocument();
  });

  test('inputs should have mock values', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: 1 } }} />
        </Router>
      </MockedProvider>
    );

    await wait();

    expect(container.querySelector('input[name="label"]').getAttribute('value')).toBe('important');
    expect(container.querySelector('input[name="description"]').getAttribute('value')).toBe(
      'important label'
    );
    expect(container.querySelector('input[name="isReserved"]').getAttribute('value')).toBe('false');
    expect(container.querySelector('input[name="isActive"]').getAttribute('value')).toBe('true');

    expect(container.querySelector('input[name="languageId"]').getAttribute('value')).toBe('1');
  });
});
