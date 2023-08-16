import { render, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { HSM_LIST, TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';
import { HSMList } from './HSMList';
import { hsmTemplatesCountQuery } from 'mocks/Template';
import userEvent from '@testing-library/user-event';
import { SYNC_HSM_TEMPLATES } from 'graphql/mutations/Template';

let syncCalled = false;

export const syncTemplateQuery = {
  request: {
    query: SYNC_HSM_TEMPLATES,
  },
  result: () => {
    syncCalled = true;
    return {
      data: {
        syncHsmTemplate: {
          errors: null,
          message: 'successfull',
        },
      },
    };
  },
};

const mocks = [...TEMPLATE_MOCKS, hsmTemplatesCountQuery, syncTemplateQuery, ...HSM_LIST];

const template = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <HSMList />
    </Router>
  </MockedProvider>
);

test('click on HSM update button should call the sync api', async () => {
  const { getByTestId } = render(template);

  await waitFor(() => {
    expect(getByTestId('updateHsm')).toBeInTheDocument();
  });

  userEvent.click(getByTestId('updateHsm'));

  await waitFor(() => {
    expect(syncCalled).toBeTruthy();
  });
});
