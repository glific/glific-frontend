import { render, waitFor, within, fireEvent, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import Router from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { HSM } from './HSM';
import { TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<any>('react-router-dom')),
  useParams: vi.fn(),
}));

test('HSM form is loaded correctly in edit mode', async () => {
  vi.spyOn(Router, 'useParams').mockReturnValue({ id: '1' });
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BrowserRouter>
        <HSM />
      </BrowserRouter>
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Edit HSM Template')).toBeInTheDocument();
  });
});

test('check for validations for the HSM form', async () => {
  const user = userEvent.setup();
  vi.spyOn(Router, 'useParams').mockReturnValue({ id: undefined });
  const { getByText, container } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <BrowserRouter>
        <HSM />
      </BrowserRouter>
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Add a new HSM Template')).toBeInTheDocument();
  });

  const { queryByText } = within(container.querySelector('form') as HTMLElement);
  const button: any = queryByText('Submit for Approval');
  await user.click(button);
  await waitFor(() => {
    expect(queryByText('Title is required.')).toBeInTheDocument();
    expect(queryByText('Message is required.')).toBeInTheDocument();
  });

  // we should have 2 errors

  fireEvent.change(container.querySelector('input[name="label"]') as HTMLInputElement, {
    target: {
      value: 'We are not allowing a really long title, and we should trigger validation for this.',
    },
  });
  // we should still have 2 errors
  expect(queryByText('Title is required.')).toBeInTheDocument();
  expect(queryByText('Message is required.')).toBeInTheDocument();
});
