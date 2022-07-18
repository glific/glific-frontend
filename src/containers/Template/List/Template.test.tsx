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
import { importTemplateMutation } from 'mocks/Template';
import { ProviderContext } from 'context/session';

afterEach(cleanup);
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const templateString = `"Template Id","Template Name","Body","Type","Quality Rating","Language","Status","Created On"
"6344689","common_otp","Your OTP for {{1}} is {{2}}. This is valid for {{3}}.","TEXT","Unknown","English","Enabled","2022-03-10"`;

const speedSendProps: any = {
  title: 'Speed sends',
  listItem: 'sessionTemplates',
  listItemName: 'speed send',
  pageLink: 'speed-send',
  listIcon: <div></div>,
  filters: { isHsm: false },
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

  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  await waitFor(() => {
    const showTranslationButton = screen.getByText('DownArrow.svg');
    expect(showTranslationButton).toBeInTheDocument();

    fireEvent.click(showTranslationButton);

    // toggling
    fireEvent.click(showTranslationButton);
  });
});

const hsmProps: any = {
  title: 'Templates',
  listItem: 'sessionTemplates',
  listItemName: 'HSM Template',
  pageLink: 'template',
  listIcon: <div></div>,
  filters: { isHsm: true },
  isHSM: true,
  buttonLabel: 'Create HSM Template',
};

const hsmMocks = [...HSM_LIST, getOrganizationBSP, importTemplateMutation];

const hsmComponent = (
  <ProviderContext.Provider value={{ provider: 'gupshup_enterprise', setProvider: jest.fn() }}>
    <Router>
      <MockedProvider mocks={hsmMocks} addTypename={false}>
        <Template {...hsmProps} />
      </MockedProvider>
    </Router>
  </ProviderContext.Provider>
);

test('it renders hsm list component', async () => {
  render(hsmComponent);
  // List rendered with status as approved
  const listOfTemplates = await screen.findAllByText('Account Balance');
  expect(listOfTemplates.length).toBeGreaterThanOrEqual(1);
});

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

test('reason column should appear when rejected templates are fetched', async () => {
  render(hsmComponent);

  const rejectCheckbox = await screen.findByRole('checkbox', { name: 'Rejected' });
  fireEvent.click(rejectCheckbox);
  screen.getByText('Loading...');

  const testLoadingRemoved = await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

  const rejectedSvgElement = await screen.findByText('test reason');
  expect(rejectedSvgElement).toBeInTheDocument();
});
