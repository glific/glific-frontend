import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';

import { ORGANISATION_MOCKS } from '../SettingList.test.helper';
import { Organisation } from './Organisation';

const mocks = ORGANISATION_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/settings/organization']}>
      <Organisation />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render the placeholders correctly', async () => {
  const { getByTestId, getByText } = render(wrapper);

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByTestId('formLayout')).toHaveTextContent('Organisation name');
    expect(getByTestId('formLayout')).toHaveTextContent('Supported languages');
    expect(getByTestId('formLayout')).toHaveTextContent('Default language');
    expect(getByTestId('formLayout')).toHaveTextContent('Organisation phone number');
    expect(getByTestId('formLayout')).toHaveTextContent('Recieve low balance threshold mails once a week.​');
    expect(getByTestId('formLayout')).toHaveTextContent(
      'Recieve critical balance threshold mails every two days.'
    );
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
    UserEvent.click(Button);
  });
});

test('it renders component in edit mode', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={[...ORGANISATION_MOCKS]} addTypename={false}>
      <Router>
        <Organisation />
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

    fireEvent.click(phoneNumber);
    expect(orgName?.value).toBe('Glific');
    expect(signaturePhrase?.value).toBe('Please change me, NOW!');
    expect(phoneNumber?.value).toBe('917834811114');
    expect(lowBalanceThreshold?.value).toBe('10');
    expect(criticalBalanceThreshold?.value).toBe('5');
  });

  await waitFor(() => {
    const submit = getByTestId('submitActionButton');
    fireEvent.click(submit);
  });
});
