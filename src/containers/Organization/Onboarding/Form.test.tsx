import { MemoryRouter } from 'react-router';
import RegistrationForm from './Form';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;
mockedAxios.post.mockResolvedValue({
  data: {
    is_valid: true,
  },
});

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

const renderForm = (
  <GoogleReCaptchaProvider reCaptchaKey={'test key'}>
    <MockedProvider>
      <MemoryRouter initialEntries={[`/organization-registration/setup`]}>
        <RegistrationForm />
      </MemoryRouter>
    </MockedProvider>
  </GoogleReCaptchaProvider>
);

beforeEach(() => {
  cleanup();
});

test('it should render platform Details page', async () => {
  const { getByTestId } = render(renderForm);

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Bot Details');
  });
});

test('it opens and closes dialog box', async () => {
  render(renderForm);

  await waitFor(() => {
    expect(screen.getAllByText('Reach out here')[0]).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByText('Reach out here')[0]);
  const dialogBox = screen.getByTestId('dialogBox');

  await waitFor(() => {
    expect(dialogBox).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('close-button'));

  await waitFor(() => {
    expect(dialogBox).not.toBeInTheDocument();
  });
});

test('it sends email to support', async () => {
  render(renderForm);

  await waitFor(() => {
    expect(screen.getAllByText('Reach out here')[0]).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByText('Reach out here')[0]);

  const dialog = screen.getByText('Write to us');

  await waitFor(() => {
    expect(dialog).toBeInTheDocument();
  });

  //checking if it closes the dialog
  fireEvent.click(screen.getByTestId('close-button'));

  fireEvent.click(screen.getAllByText('Reach out here')[0]);

  const inputFields = screen.getAllByRole('textbox');
  const [name, email, message] = inputFields;

  fireEvent.change(name, { target: { value: 'name' } });
  fireEvent.change(email, { target: { value: 'random@email.com' } });
  fireEvent.change(message, { target: { value: 'message' } });

  fireEvent.click(screen.getByText('Send'));
});

test('it should submit the form', async () => {
  const { getByTestId, getAllByRole, getAllByTestId, getByText } = render(renderForm);

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Bot Details');
  });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByText('Name is required.')).toBeInTheDocument();
  });

  const inputFieldsPlatformDetails = getAllByRole('textbox');

  const [orgName, phoneNumber, appName, apiKey, shortcode] = inputFieldsPlatformDetails;

  fireEvent.change(orgName, { target: { value: 'org name' } });
  fireEvent.change(phoneNumber, { target: { value: '7834811114' } });
  fireEvent.change(appName, { target: { value: 'app name' } });
  fireEvent.change(apiKey, { target: { value: 'api-key' } });
  fireEvent.change(shortcode, { target: { value: 'glific' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  // closes the dialog box
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Confirm'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Organization');
  });

  fireEvent.click(getByTestId('back-button'));
  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Organization');
  });

  const inputFieldsOrgdetails = getAllByRole('textbox');

  const [registeredAddress, gstin] = inputFieldsOrgdetails;

  fireEvent.change(registeredAddress, { target: { value: 'address' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.change(gstin, { target: { value: '123456789012345' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Billing Plan');
  });

  fireEvent.click(getByTestId('back-button'));
  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Billing Plan');
  });

  const inputFieldsPaymentdetails = getAllByRole('textbox');
  const [name, designation, phone, email] = inputFieldsPaymentdetails;

  const radioButtons = getAllByTestId('radio-btn');
  fireEvent.click(radioButtons[1]);

  fireEvent.change(name, { target: { value: 'Default finance poc name' } });
  fireEvent.change(designation, { target: { value: 'finance' } });
  fireEvent.change(phone, { target: { value: '09421050449' } });
  fireEvent.change(email, { target: { value: 'finance@email.com' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Submitter & Signing Authority');
  });

  fireEvent.click(getByTestId('back-button'));
  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Submitter & Signing Authority Details');
  });

  const inputFieldssigningdetails = getAllByRole('textbox');
  const [
    submitterName,
    submitterEmail,
    signingAuthorityName,
    signingAuthorityDesignation,
    signingAuthorityEmail,
  ] = inputFieldssigningdetails;

  fireEvent.change(submitterName, { target: { value: 'Default submitter' } });
  fireEvent.change(submitterEmail, { target: { value: 'submitter@email.com' } });

  fireEvent.change(signingAuthorityName, { target: { value: 'Default signing' } });
  fireEvent.change(signingAuthorityDesignation, { target: { value: 'signing authority' } });
  fireEvent.change(signingAuthorityEmail, { target: { value: 'signing@email.com' } });

  const checkboxes = getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]);

  fireEvent.keyDown(screen.getByText('Terms and conditions'), { key: 'Escape', code: 'escape' });
  fireEvent.click(checkboxes[0]);

  await waitFor(() => {
    expect(screen.getByText('Terms and conditions')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('I Agree'));

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByText('Success!')).toBeInTheDocument();
  });
});

test('it should disgree and send an email', async () => {
  const { getByTestId, getAllByRole, getAllByTestId } = render(renderForm);

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Bot Details');
  });

  const inputFieldsPlatformDetails = getAllByRole('textbox');

  const [orgName, phoneNumber, appName, apiKey, shortcode] = inputFieldsPlatformDetails;

  fireEvent.change(orgName, { target: { value: 'org name' } });
  fireEvent.change(phoneNumber, { target: { value: '7834811114' } });
  fireEvent.change(appName, { target: { value: 'app name' } });
  fireEvent.change(apiKey, { target: { value: 'api-key' } });
  fireEvent.change(shortcode, { target: { value: 'glific' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Confirm'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Organization');
  });

  const inputFieldsOrgdetails = getAllByRole('textbox');

  const [registeredAddress, gstin] = inputFieldsOrgdetails;

  fireEvent.change(registeredAddress, { target: { value: 'address' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.change(gstin, { target: { value: '123456789012345' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Billing Plan');
  });

  const inputFieldsPaymentdetails = getAllByRole('textbox');
  const [name, designation, phone, email] = inputFieldsPaymentdetails;

  const radioButtons = getAllByTestId('radio-btn');
  fireEvent.click(radioButtons[1]);

  fireEvent.change(name, { target: { value: 'Default finance poc name' } });
  fireEvent.change(designation, { target: { value: 'finance' } });
  fireEvent.change(phone, { target: { value: '09421050449' } });
  fireEvent.change(email, { target: { value: 'finance@email.com' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Submitter & Signing Authority');
  });

  const checkboxes = getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]);

  await waitFor(() => {
    expect(screen.getByText('Terms and conditions')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('I Disagree'));

  const inputFields = screen.getAllByRole('textbox');
  const [senderName, senderEmail, message] = inputFields;

  fireEvent.change(senderName, { target: { value: 'name' } });
  fireEvent.change(senderEmail, { target: { value: 'random@email.com' } });
  fireEvent.change(message, { target: { value: 'message' } });

  fireEvent.click(screen.getByText('Send'));
});
