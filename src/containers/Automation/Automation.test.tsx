import React from 'react';

import { Automation } from './Automation';
import { MockedProvider } from '@apollo/client/testing';
import { render, wait, fireEvent } from '@testing-library/react';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../../mocks/Organization';
import { getAutomationQuery, filterAutomationQuery } from '../../mocks/Automation';

const mocks = [
  ...getOrganizationQuery,
  getAutomationQuery,
  filterAutomationQuery,
  getOrganizationLanguagesQuery,
];
const automation = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Automation match={{ params: { id: 1 } }} />
  </MockedProvider>
);

it('should render Automation', async () => {
  const wrapper = render(automation);
  await wait();
  expect(wrapper.container).toBeInTheDocument();
});

it('should convert comma separated keywords into array', async () => {
  const { getByText } = render(automation);
  await wait();
  const button = getByText('Save');
  fireEvent.click(button);
  await wait();
  expect(getByText('Automation edited successfully!')).toBeInTheDocument();
});
