import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { TEMPLATE_MOCKS, HSM_LIST } from 'containers/Template/Template.test.helper';
import { Template } from './Template';
import { getOrganizationBSP } from 'mocks/Organization';
import * as common from 'common/notification';
import {
  bulkApplyMutation,
  importTemplateMutation,
  importTemplateMutationWithErrors,
} from 'mocks/Template';
import { ProviderContext } from 'context/session';
import { getFilterTagQuery } from 'mocks/Tag';

afterEach(cleanup);
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const templateString = `"Template Id","Template Name","Body","Type","Quality Rating","Language","Status","Created On"
"6344689","common_otp","Your OTP for {{1}} is {{2}}. This is valid for {{3}}.","TEXT","Unknown","English","Enabled","2022-03-10"`;
const errorTemplateString = `"Template Id","Template Name","Body","Type","Quality Rating","Language","Status","Created On"
"6344689","common_otp","Your OTP for {{1}} is {{2}}. This is valid for {}}.","TEXT","Unknown","English","Enabled","2022-03-10"`;

export const bulkApplyString = `Language,Title,Message,Sample Message,Element Name,Category,Attachment Type,Attachment URL,Has Buttons,Button Type,CTA Button 1 Type,CTA Button 1 Title,CTA Button 1 Value,CTA Button 2 Type,CTA Button 2 Title,CTA Button 2 Value,Quick Reply 1 Title,Quick Reply 2 Title,Quick Reply 3 Title
English,Welcome glific,"Hi {{1}}, Welcome to the world","Hi [User], Welcome to the world",welcome_glific,TRANSACTIONAL,,,FALSE,,,,,,,,,,`;

const speedSendProps: any = {
  title: 'Speed sends',
  listItem: 'sessionTemplates',
  listItemName: 'speed send',
  pageLink: 'speed-send',
  listIcon: <div></div>,
  filters: { isHsm: false },
  isHsm: false,
  buttonLabel: 'Create Speed Send',
};

test('it renders speed-send list component', async () => {
  render(
    <Router>
      <MockedProvider mocks={TEMPLATE_MOCKS} addTypename={false}>
        <Template {...speedSendProps} />
      </MockedProvider>
    </Router>
  );

  await waitFor(() => {
    expect(screen.getByTestId('down-arrow')).toBeInTheDocument();
  });
  const showTranslationButton = screen.getByTestId('down-arrow');
  fireEvent.click(showTranslationButton);

  // toggling
  fireEvent.click(showTranslationButton);
});

const hsmProps: any = {
  title: 'Templates',
  listItem: 'sessionTemplates',
  listItemName: 'HSM Template',
  pageLink: 'template',
  listIcon: <div></div>,
  filters: { isHsm: true },
  isHSM: true,
  buttonLabel: 'Create',
};

describe('HSM templates', () => {
  // Todo: consuming a lot of queries. Need to check if we should refactor it
  const hsmMocks = [...HSM_LIST, ...HSM_LIST, ...HSM_LIST, bulkApplyMutation, getFilterTagQuery];
  const hsmComponent = (
    <Router>
      <MockedProvider mocks={hsmMocks} addTypename={false}>
        <Template {...hsmProps} />
      </MockedProvider>
    </Router>
  );

  test('it renders hsm list component', async () => {
    render(hsmComponent);
    // List rendered with status as approved
    const listOfTemplates = await screen.findAllByText('Account Balance');
    expect(listOfTemplates.length).toBeGreaterThanOrEqual(1);
  });

  test('reason column should appear when rejected templates are fetched', async () => {
    render(hsmComponent);

    const dropdown = screen.getByTestId('dropdown-template');

    // Clean the dropdown text content to remove invisible characters
    const cleanedDropdownText = dropdown?.textContent?.replace(/\p{C}/gu, '');

    // Test if the dropdown text content is "Approved"
    expect(cleanedDropdownText).toBe('Approved');

    screen.getByText('Loading...');

    await waitForElementToBeRemoved(() => screen.getByText('Loading...'));
  });

  test('should have an option of bulk applying templates using csv file', async () => {
    const { getByText } = render(hsmComponent);

    const notificationFunc = vi.spyOn(common, 'setNotification');
    await waitFor(() => {
      expect(getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      const importTemplateButton = getByText('Bulk apply');
      expect(importTemplateButton).toBeInTheDocument();
      fireEvent.click(importTemplateButton);
    });

    await waitFor(() => {
      const csvFile = bulkApplyString;
      const file = new File([csvFile], 'test.csv', {
        type: 'text/csv',
      });
      const input = screen.getByTestId('import');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      fireEvent.change(input);
    });

    await waitFor(() => {
      expect(notificationFunc).toHaveBeenCalledWith(
        'Templates applied successfully. Please check the csv file for the results'
      );
    });
  });
});

describe('Provider: Gupshup enterprise', () => {
  const hsmMocks = [
    ...HSM_LIST,
    ...HSM_LIST,
    ...HSM_LIST,
    getOrganizationBSP,
    importTemplateMutation,
    importTemplateMutationWithErrors,
    getFilterTagQuery,
  ];
  const hsmComponent = (
    <ProviderContext.Provider value={{ provider: 'gupshup_enterprise', setProvider: vi.fn() }}>
      <Router>
        <MockedProvider mocks={hsmMocks} addTypename={false}>
          <Template {...hsmProps} />
        </MockedProvider>
      </Router>
    </ProviderContext.Provider>
  );

  test('should import templates using csv file', async () => {
    const { getByText } = render(hsmComponent);

    await waitFor(() => {
      expect(getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      const importTemplateButton = getByText('Import templates');
      expect(importTemplateButton).toBeInTheDocument();
      fireEvent.click(importTemplateButton);
    });

    await waitFor(() => {
      const csvFile = templateString;
      const file = new File([csvFile], 'test.csv', {
        type: 'text/csv',
      });
      const input = screen.getByTestId('import');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      fireEvent.change(input);
    });

    await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));
    await waitFor(() => {});
  });

  test('it shows a warning when we get an error while importing', async () => {
    const { getByText } = render(hsmComponent);

    const notificationFunc = vi.spyOn(common, 'setNotification');

    await waitFor(() => {
      expect(getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      const importTemplateButton = getByText('Import templates');
      expect(importTemplateButton).toBeInTheDocument();
      fireEvent.click(importTemplateButton);
    });

    await waitFor(() => {
      const csvFile = errorTemplateString;
      const file = new File([csvFile], 'test.csv', {
        type: 'text/csv',
      });
      const input = screen.getByTestId('import');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      fireEvent.change(input);
    });

    await waitFor(() => {
      expect(notificationFunc).toHaveBeenCalledWith('Error importing templates', 'warning');
    });
  });
});
