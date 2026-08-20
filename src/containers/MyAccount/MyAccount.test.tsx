import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import {
  getCurrentUserQuery,
  getCurrentUserNullEmailQuery,
  updateLanguageQuery,
  updateAccountEmailOnlyQuery,
  updateAccountWithPasswordQuery,
  updateAccountIncorrectOtpQuery,
  updateAccountTooManyAttemptsQuery,
  updateAccountEmailTakenQuery,
} from 'mocks/User';
import { getOrganizationLanguagesQuery } from 'mocks/Organization';
import { MyAccount } from './MyAccount';

const mocks = [getCurrentUserQuery, getOrganizationLanguagesQuery];

vi.mock('axios');
const mockedAxios = axios as any;
const user = userEvent.setup();

const renderMyAccount = (mockedResponses: any[] = mocks) =>
  render(
    <MockedProvider mocks={mockedResponses} addTypename={false}>
      <MemoryRouter>
        <MyAccount />
      </MemoryRouter>
    </MockedProvider>
  );

const generateOTP = async (container: HTMLElement) => {
  const responseData = { data: { data: { data: {} } } };
  mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
  await user.click(screen.getByTestId('generateOTP'));
  await waitFor(() => {
    expect(screen.getByTestId('saveButton')).toBeInTheDocument();
  });
  // Name/Phone/Email all render as type="text" too, so the otp field (added last, once
  // revealed) is the last type="text" input in the DOM rather than the first.
  const textInputs = container.querySelectorAll('input[type="text"]');
  return textInputs[textInputs.length - 1] as HTMLInputElement;
};

describe('<MyAccount />', () => {
  test('it should render', async () => {
    const { getByText, findByTestId } = renderMyAccount();

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    const myAccount = await findByTestId('MyAccount');
    expect(myAccount).toHaveTextContent('Change Password');
  });

  test('email and password fields are visible by default, with only the Generate OTP button', async () => {
    const { container } = renderMyAccount();

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    expect(emailInput.value).toBe('you@domain.com');
    expect(passwordInput).toBeEnabled();
    expect(screen.getByTestId('generateOTP')).toBeInTheDocument();
    expect(screen.queryByTestId('saveButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cancelButton')).not.toBeInTheDocument();
  });

  test('clicking Generate OTP reveals the otp field and Save/Cancel buttons', async () => {
    const { container } = renderMyAccount();

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const otpInput = await generateOTP(container);

    expect(otpInput).toBeInTheDocument();
    expect(screen.getByTestId('saveButton')).toBeInTheDocument();
    expect(screen.getByTestId('cancelButton')).toBeInTheDocument();
    expect(screen.queryByTestId('generateOTP')).not.toBeInTheDocument();
  });

  test('saving with only the email changed succeeds without requiring a password', async () => {
    const emailMocks = [
      getCurrentUserQuery,
      getCurrentUserQuery,
      updateAccountEmailOnlyQuery,
      getOrganizationLanguagesQuery,
      getOrganizationLanguagesQuery,
    ];
    const { container } = renderMyAccount(emailMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const otpInput = await generateOTP(container);
    await user.type(otpInput, '76554');

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@domain.com');

    await user.click(screen.getByTestId('saveButton'));

    await waitFor(() => {
      expect(screen.getByText('Account updated successfully!')).toBeInTheDocument();
    });
    // the form collapses back to the default Generate OTP view
    expect(screen.getByTestId('generateOTP')).toBeInTheDocument();
  });

  test('saving a new password succeeds without changing the email', async () => {
    const passwordMocks = [
      getCurrentUserQuery,
      getCurrentUserQuery,
      updateAccountWithPasswordQuery,
      getOrganizationLanguagesQuery,
      getOrganizationLanguagesQuery,
    ];
    const { container } = renderMyAccount(passwordMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const otpInput = await generateOTP(container);
    await user.type(otpInput, '76554');

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(passwordInput, 'Password123!');

    await user.click(screen.getByTestId('saveButton'));

    await waitFor(() => {
      expect(screen.getByText('Account updated successfully!')).toBeInTheDocument();
    });
  });

  test('incorrect OTP shows a friendly error instead of saving', async () => {
    const errorMocks = [
      getCurrentUserQuery,
      getCurrentUserQuery,
      updateAccountIncorrectOtpQuery,
      getOrganizationLanguagesQuery,
      getOrganizationLanguagesQuery,
    ];
    const { container } = renderMyAccount(errorMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const otpInput = await generateOTP(container);
    await user.type(otpInput, '1234');

    await user.click(screen.getByTestId('saveButton'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid OTP')).toBeInTheDocument();
    });
    expect(screen.queryByText('Account updated successfully!')).not.toBeInTheDocument();
  });

  test('too many attempts surfaces the backend message', async () => {
    const errorMocks = [
      getCurrentUserQuery,
      getCurrentUserQuery,
      updateAccountTooManyAttemptsQuery,
      getOrganizationLanguagesQuery,
      getOrganizationLanguagesQuery,
    ];
    const { container } = renderMyAccount(errorMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const otpInput = await generateOTP(container);
    await user.type(otpInput, '4567');

    await user.click(screen.getByTestId('saveButton'));

    await waitFor(() => {
      expect(screen.getByText('Too many attempts')).toBeInTheDocument();
    });
  });

  test('a duplicate email surfaces the backend validation error instead of a false success toast', async () => {
    const errorMocks = [
      getCurrentUserQuery,
      getCurrentUserQuery,
      updateAccountEmailTakenQuery,
      getOrganizationLanguagesQuery,
      getOrganizationLanguagesQuery,
    ];
    const { container } = renderMyAccount(errorMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const otpInput = await generateOTP(container);
    await user.type(otpInput, '76554');

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'taken@domain.com');

    await user.click(screen.getByTestId('saveButton'));

    await waitFor(() => {
      expect(screen.getByText('has already been taken')).toBeInTheDocument();
    });
    expect(screen.queryByText('Account updated successfully!')).not.toBeInTheDocument();
  });

  test('cancel discards changes and collapses back to the Generate OTP view', async () => {
    const { container } = renderMyAccount();

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const otpInput = await generateOTP(container);
    await user.type(otpInput, '76554');

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'discarded@domain.com');

    await user.click(screen.getByTestId('cancelButton'));

    expect(screen.getByTestId('generateOTP')).toBeInTheDocument();
    expect(emailInput.value).toBe('you@domain.com');
  });

  test('a null email from the backend renders as an empty field instead of crashing', async () => {
    const nullEmailMocks = [getCurrentUserNullEmailQuery, getOrganizationLanguagesQuery];
    const { container } = renderMyAccount(nullEmailMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    expect(emailInput.value).toBe('');
    expect(screen.getByTestId('generateOTP')).toBeInTheDocument();
  });

  test('changing the interface language does not require OTP', async () => {
    const languageMocks = [getCurrentUserQuery, updateLanguageQuery, getOrganizationLanguagesQuery];
    renderMyAccount(languageMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    await waitFor(() => {
      const dropdown = screen.getByTestId('dropdown');
      const { getByRole } = within(dropdown);
      const inputDropdown = getByRole('combobox');
      fireEvent.mouseDown(inputDropdown);
    });
    const [, hindi] = screen.getAllByRole('option');

    await waitFor(() => {
      hindi.click();
      expect(screen.getByText('Language changed successfully!')).toBeInTheDocument();
    });
  });

  test('generate OTP error response', async () => {
    renderMyAccount();

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    // let's mock error case sending of OTP
    const errorMessage = 'Cannot register 919967665667';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await user.click(screen.getByTestId('generateOTP'));

    // close the alert
    await waitFor(() => {
      expect(screen.getByTestId('crossIcon')).toBeInTheDocument();
    });
    const closeAlert = screen.getByTestId('crossIcon');
    await user.click(closeAlert);
  });
});
