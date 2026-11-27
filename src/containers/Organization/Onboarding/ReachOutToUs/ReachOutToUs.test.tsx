import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import { ONBOARD_URL_REACT_OUT } from 'config';
import { ReachOutToUs } from './ReachOutToUs';

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: () => ({ executeRecaptcha: async () => 'captcha-token' }),
}));

const props = {
  open: true,
  setOpen: vi.fn(),
  handleStepChange: vi.fn(),
  saveData: vi.fn(),
};

const fillAndSend = () => {
  const [name, email, orgName, message] = screen.getAllByRole('textbox');

  fireEvent.change(name, { target: { value: 'Jane Doe' } });
  fireEvent.change(email, { target: { value: 'jane@example.org' } });
  fireEvent.change(orgName, { target: { value: 'Some NGO' } });
  fireEvent.change(message, { target: { value: 'We would like to know more.' } });

  fireEvent.click(screen.getByText('Send'));
};

afterEach(() => {
  mockedAxios.post.mockReset();
});

test('it sends the query with a reCAPTCHA token', async () => {
  mockedAxios.post.mockResolvedValueOnce({ data: { is_valid: true, messages: {} } });
  render(<ReachOutToUs {...props} />);

  fillAndSend();

  await waitFor(() => {
    expect(mockedAxios.post).toHaveBeenCalledWith(
      ONBOARD_URL_REACT_OUT,
      expect.objectContaining({ email: 'jane@example.org', token: 'captcha-token' }),
      expect.anything()
    );
  });

  await waitFor(() => {
    expect(screen.getByText('Thankyou for reaching out to us! We will get back to you shortly.')).toBeInTheDocument();
  });
});

test('it shows the error when the server rejects the query', async () => {
  mockedAxios.post.mockRejectedValueOnce({
    response: { status: 400, data: { error: { status: 400, message: 'Failed to verify Google Captcha' } } },
  });
  render(<ReachOutToUs {...props} />);

  fillAndSend();

  await waitFor(() => {
    expect(screen.getByText('Failed to verify Google Captcha')).toBeInTheDocument();
  });
});
