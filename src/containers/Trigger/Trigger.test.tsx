import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { Trigger } from './Trigger';
import { getTriggerQuery } from '../../mocks/Trigger';
import { LIST_ITEM_MOCKS } from '../SettingList/SettingList.test.helper';
import { LIST_ITEM_MOCKS as SearchMocks } from '../Search/Search.test.helper';
const mocks = [getTriggerQuery, ...LIST_ITEM_MOCKS, ...SearchMocks];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Trigger match={{ params: { id: 1 } }} />
  </MockedProvider>
);

test('should load trigger edit form', async () => {
  const { getByText, getByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const formLayout = getByTestId('formLayout');
    expect(formLayout).toHaveTextContent('days');
  });
});
