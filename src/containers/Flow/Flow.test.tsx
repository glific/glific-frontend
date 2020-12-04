import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';

import { Automation } from './Flow';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../../mocks/Organization';
import { getAutomationQuery, filterAutomationQuery } from '../../mocks/Automation';
import { MemoryRouter } from 'react-router-dom';

const mocks = [
  ...getOrganizationQuery,
  getAutomationQuery,
  filterAutomationQuery,
  getOrganizationLanguagesQuery,
];
const automation = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Automation match={{ params: { id: 1 } }} />
    </MemoryRouter>
  </MockedProvider>
);

it('should render Automation', async () => {
  const wrapper = render(automation);
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

it('should convert comma separated keywords into array', async () => {
  const { getByText } = render(automation);
  await waitFor(() => {
    const button = getByText('Save');
    fireEvent.click(button);
  });

  //Need an assertion here
  await waitFor(() => {});
});
