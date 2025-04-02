import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { HSM_LIST, bulkApplyMutation, bulkApplyMutationWIthError } from 'mocks/Template';
import { HSMList } from './HSMList';
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
const mocks = [...HSM_LIST, ...HSM_LIST, ...HSM_LIST, ...HSM_LIST];

const template = (mockQuery?: any) => (
  <MockedProvider mocks={mockQuery ? [...mocks, mockQuery] : mocks} addTypename={false}>
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

test('bulk apply templates', async () => {
  const { getByTestId } = render(template(bulkApplyMutation));

  await waitFor(() => {
    expect(getByTestId('updateHsm')).toBeInTheDocument();
  });

  const mockFile = new File(
    [
      'Language,Title,Message,Sample Message,Element Name,Category,Attachment Type,Attachment URL,Has Buttons,Button Type,CTA Button 1 Type,CTA Button 1 Title,CTA Button 1 Value,CTA Button 2 Type,CTA Button 2 Title,CTA Button 2 Value,Quick Reply 1 Title,Quick Reply 2 Title,Quick Reply 3 Title\r\nEnglish,Welcome Arogya,"Hi {{1}},\nWelcome to the world","Hi [Akhilesh],\nWelcome to the world",bulk_hsm_welcome,UTILITY,,,FALSE,,,,,,,,,,\r\nEnglish,Signup,"Hi {{1}},\nSignup Here","Hi [Akhilesh],\nSignup Here",bulk_hsm_signup,UTILITY,,,TRUE,QUICK_REPLY,,,,,,,Yes,No,\r\nEnglish,Help,"Hi {{1}},\nNeed help?","Hi [Akhilesh],\nNeed help?",bulk_hsm_help,UTILITY,,,TRUE,CALL_TO_ACTION,Phone Number,Call here,8979120220,URL,Visit Here,https://github.com/glific,,,\r\nEnglish,Activity,"Hi {{1}},\nLook at this image.","Hi [Akhilesh],\nLook at this image.",bulk_hsm_activity,UTILITY,image,https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg,FALSE,,,,,,,,,,',
    ],
    'testFile.csv',
    { type: 'text/csv' }
  );

  fireEvent.change(getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getByText('Please wait while we process all the templates')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(
      'Templates applied successfully. Please check the csv file for the results'
    );
  });
});

test('bulk apply templates', async () => {
  const { getByTestId } = render(template(bulkApplyMutationWIthError));

  await waitFor(() => {
    expect(getByTestId('updateHsm')).toBeInTheDocument();
  });

  const mockFile = new File(['file content'], 'testFile.csv', { type: 'text/csv' });

  fireEvent.change(getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getByText('Please wait while we process all the templates')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('An error occured! Please check the format of the file', 'warning');
  });
});
