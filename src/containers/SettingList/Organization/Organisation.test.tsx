import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router, MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

import { ORGANIZATION_MOCKS, ORGANIZATION_MOCKS2 } from '../SettingList.test.helper';
import { Organization } from './Organization';

const user = userEvent.setup();
const mocks = ORGANIZATION_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/settings/organization']}>
      <Organization />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render the placeholders correctly', async () => {
  const { getByTestId, getByText } = render(wrapper);

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('formLayout')).toHaveTextContent('Organization name');
    expect(getByTestId('formLayout')).toHaveTextContent('Supported languages');
    expect(getByTestId('formLayout')).toHaveTextContent('Default language');
    expect(getByTestId('formLayout')).toHaveTextContent('Organization phone number');
    // Todo: Fix this
    // expect(getByTestId('formLayout')).toHaveTextContent('Recieve low balance threshold mails once a week​');
    // expect(getByTestId('formLayout')).toHaveTextContent(
    //   'Recieve critical balance threshold mails every two days.'
    // );
    expect(getByTestId('formLayout')).toHaveTextContent('Recieve warning mails?');
  });
});

test('it renders component properly', async () => {
  const { getByText, getByTestId } = render(wrapper);
  // loading is show initially
  await waitFor(() => {
    expect(getByText('Loading...')).toBeInTheDocument();
  });
});

test('it renders component and clicks cancel', async () => {
  const { getByText } = render(wrapper);
  // loading is show initially
  await waitFor(() => {
    expect(getByText('Loading...')).toBeInTheDocument();
  });
  await waitFor(() => {
    const Button = screen.getByText('Cancel');
    expect(Button).toBeInTheDocument();
    // click on Cancel
    user.click(Button);
  });
});

test('it renders component in edit mode', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={[...ORGANIZATION_MOCKS]} addTypename={false}>
      <Router>
        <Organization />
      </Router>
    </MockedProvider>
  );
  // loading is show initially
  await waitFor(() => {
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  //correct values are rendered in the form
  await waitFor(() => {
    const inputElements = screen.getAllByRole('textbox');
    const numberInputElements = screen.getAllByRole('spinbutton');

    const orgName = inputElements[0] as HTMLInputElement;
    const signaturePhrase = inputElements[1] as HTMLInputElement;
    const phoneNumber = inputElements[2] as HTMLInputElement;
    const lowBalanceThreshold = numberInputElements[0] as HTMLInputElement;
    const criticalBalanceThreshold = numberInputElements[1] as HTMLInputElement;

    user.click(phoneNumber);
    expect(orgName?.value).toBe('Glific');
    expect(signaturePhrase?.value).toBe('Please change me, NOW!');
    expect(phoneNumber?.value).toBe('917834811114');
    expect(lowBalanceThreshold?.value).toBe('10');
    expect(criticalBalanceThreshold?.value).toBe('5');
  });

  await waitFor(() => {
    const submit = getByTestId('submitActionButton');
    user.click(submit);
  });
});

test('it renders confirmation popup with new phone number when allowBotNumberUpdate is true', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={[...ORGANIZATION_MOCKS]} addTypename={false}>
      <Router>
        <Organization />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('Loading...')).toBeInTheDocument();
  });
  await waitFor(() => {
    const inputElements = screen.getAllByRole('textbox');
    const phoneInput = inputElements[2] as HTMLInputElement;
    expect(phoneInput?.value).toBe('917834811114');
    user.clear(phoneInput);
    user.type(phoneInput, '919999999999');
  });

  await waitFor(() => {
    const submit = getByTestId('submitActionButton');
    user.click(submit);
  });

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    const content = screen.getByTestId('dialog-content');
    expect(content.textContent).toMatch(/It will not be possible/i);
  });
});

test('It does not show confirmation popup with new phone number when allowBotNumberUpdate is false', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={ORGANIZATION_MOCKS2} addTypename={false}>
      <Router>
        <Organization />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByText('Loading...')).toBeInTheDocument();
  });
  await waitFor(() => {
    const inputElements = screen.getAllByRole('textbox');
    const phoneInput = inputElements[2] as HTMLInputElement;
    expect(phoneInput?.value).toBe('911111111111');
    expect(phoneInput).toBeDisabled();
  });

  await waitFor(() => {
    const submit = getByTestId('submitActionButton');
    user.click(submit);
  });

  await waitFor(() => {
    expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
  });
});
