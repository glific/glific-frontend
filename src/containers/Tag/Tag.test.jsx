import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_LANGUAGES } from '../../graphql/queries/Tag';
import { Tag } from './Tag';
import { within } from '@testing-library/dom';

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

  it('should have a form with labels', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: null } }} />
        </Router>
      </MockedProvider>
    );

    await wait();

    const { getByText } = within(container.querySelector('form'));

    expect(getByText('label')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
    expect(getByText('Is Active')).toBeInTheDocument();
    expect(getByText('Is Reserved')).toBeInTheDocument();
    expect(getByText('Language')).toBeInTheDocument();
  });
});
