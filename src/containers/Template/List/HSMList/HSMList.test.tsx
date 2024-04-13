import { render, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { HSM_LIST, TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';
import { HSMList } from './HSMList';
import { hsmTemplatesCountQuery } from 'mocks/Template';
import userEvent from '@testing-library/user-event';
import { SYNC_HSM_TEMPLATES } from 'graphql/mutations/Template';
import { setNotification } from 'common/notification';

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

export const syncTemplateQueryWithErrors = {
  request: {
    query: SYNC_HSM_TEMPLATES,
  },
  result: () => {
    syncCalled = true;
    return {
      data: {
        syncHsmTemplate: null,
        errors: {
          message: 'Something went wrong',
        },
      },
    };
  },
};

export const syncTemplateQueryFailedQuery = {
  request: {
    query: SYNC_HSM_TEMPLATES,
  },
  error: new Error('An error occurred'),
};

// Todo: multiple calls are made here. We need to refactor this code
const mocks = [
  ...TEMPLATE_MOCKS,
  ...TEMPLATE_MOCKS,
  hsmTemplatesCountQuery,
  ...HSM_LIST,
  ...HSM_LIST,
  ...HSM_LIST,
  ...HSM_LIST,
];

const template = (mockQuery: any) => (
  <MockedProvider mocks={[...mocks, mockQuery]} addTypename={false}>
    <Router>
      <HSMList />
    </Router>
  </MockedProvider>
);

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

test('click on HSM update button should call the sync api', async () => {
  const { getByTestId } = render(template(syncTemplateQuery));

  await waitFor(() => {
    expect(getByTestId('updateHsm')).toBeInTheDocument();
  });

  userEvent.click(getByTestId('updateHsm'));

  await waitFor(() => {
    expect(syncCalled).toBeTruthy();
  });
});

test('sync api should render notification on error', async () => {
  const { getByTestId } = render(template(syncTemplateQueryWithErrors));

  await waitFor(() => {
    expect(getByTestId('updateHsm')).toBeInTheDocument();
  });

  userEvent.click(getByTestId('updateHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates.', 'warning');
  });
});

test('sync api should render notification on error', async () => {
  const { getByTestId } = render(template(syncTemplateQueryFailedQuery));

  await waitFor(() => {
    expect(getByTestId('updateHsm')).toBeInTheDocument();
  });

  userEvent.click(getByTestId('updateHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates.', 'warning');
  });
});
