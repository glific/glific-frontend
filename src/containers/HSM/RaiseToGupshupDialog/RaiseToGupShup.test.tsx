import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { RaiseToGupShup } from './RaiseToGupShup';
import { REPORT_TO_GUPSHUP } from 'graphql/mutations/Template';
import { setNotification } from 'common/notification';

const defaultProps = {
  handleCancel: vi.fn(),
  templateId: '9',
  label: 'OTP Message',
};

const rasieToGupShupMock = {
  request: {
    query: REPORT_TO_GUPSHUP,
    variables: { cc: '{"email":"example@gmail.com"}', templateId: '9' },
  },
  result: {
    data: {
      reportToGupshup: {
        errors: null,
        message: 'success',
      },
    },
  },
};

const rasieToGupShupMockWithErrors = {
  request: {
    query: REPORT_TO_GUPSHUP,
    variables: { cc: '{"email":"example@gmail.com"}', templateId: '9' },
  },
  error: new Error('An error occurred'),
};

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

const wrapper = (
  <MockedProvider>
    <MemoryRouter>
      <RaiseToGupShup {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render correct template name', async () => {
  const { getByText, getByTestId } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Report Template OTP Message to Gupshup')).toBeInTheDocument();
  });
});

test('cancel button clicked', async () => {
  const { getByTestId, getByText } = render(wrapper);

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Cancel'));
});

test('done button clicked ', async () => {
  const { getByTestId, getByText, getByRole } = render(
    <MockedProvider mocks={[rasieToGupShupMock]}>
      <MemoryRouter>
        <RaiseToGupShup {...defaultProps} />
      </MemoryRouter>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  const emailInput = getByRole('textbox');
  fireEvent.change(emailInput, { target: { value: 'example@gmail.com' } });

  fireEvent.click(getByText('Done'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('it shpould render setNotification if api fails', async () => {
  const { getByTestId, getByText, getByRole } = render(
    <MockedProvider mocks={[rasieToGupShupMockWithErrors]}>
      <MemoryRouter>
        <RaiseToGupShup {...defaultProps} />
      </MemoryRouter>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByTestId('variablesDialog')).toBeInTheDocument();
  });

  const emailInput = getByRole('textbox');
  fireEvent.change(emailInput, { target: { value: 'example@gmail.com' } });

  fireEvent.click(getByText('Done'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('An error occurred', 'warning');
  });
});

test('testing if invalid email', async () => {
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
