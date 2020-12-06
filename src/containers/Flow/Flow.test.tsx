import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';

import { Flow } from './Flow';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../../mocks/Organization';
import { getFlowQuery, filterFlowQuery } from '../../mocks/Flow';
import { MemoryRouter } from 'react-router-dom';

const mocks = [
  ...getOrganizationQuery,
  getFlowQuery,
  filterFlowQuery,
  getOrganizationLanguagesQuery,
];
const flow = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Flow match={{ params: { id: 1 } }} />
    </MemoryRouter>
  </MockedProvider>
);

it('should render Flow', async () => {
  const wrapper = render(flow);
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

it('should convert comma separated keywords into array', async () => {
  const { getByText } = render(flow);
  await waitFor(() => {
    const button = getByText('Save');
    fireEvent.click(button);
  });

  //Need an assertion here
  await waitFor(() => {});
});
