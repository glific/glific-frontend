import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { vi } from 'vitest';

import { RaiseToGupShup } from './RaiseToGupShup';
import { responseData } from 'mocks/ReportToGupshup';

vi.mock('axios');
const mockedAxios = axios as any;

const defaultProps = {
  handleCancel: vi.fn(),
  templateId: '9',
  label: 'OTP Message',
};

const wrapper = (
  <MockedProvider>
    <MemoryRouter>
      <RaiseToGupShup {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

const axiosApiCall = async () => {
  mockedAxios.get.mockImplementationOnce(() => Promise.resolve(responseData));
};

test('it should render correct template name', async () => {
  axiosApiCall();
  const { getByText, getByTestId } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Report Template OTP Message to Gupshup')).toBeInTheDocument();
  });
});

test('cancel button clicked', async () => {
  axiosApiCall();
  const { getByTestId, getByText } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Cancel'));
});

test('done button clicked ', async () => {
  axiosApiCall();
  const { getByTestId, getByText } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Done'));
});

test('testing if invalid email', async () => {
  axiosApiCall();
  const { getByTestId, getByText, getByRole } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Report Template OTP Message to Gupshup')).toBeInTheDocument();
  });

  const emailInput = getByRole('textbox');
  fireEvent.change(emailInput, { target: { value: 'invalidemail' } });

  fireEvent.click(getByText('Done'));

  await waitFor(() => {
    expect(getByText('Invalid Email')).toBeInTheDocument();
  });
});
