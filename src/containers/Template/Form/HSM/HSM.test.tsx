import { render, waitFor, within, fireEvent, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { HSM } from './HSM';
import { TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';
import { BrowserRouter } from 'react-router-dom';
import Router from 'react-router-dom';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

test('HSM form is loaded correctly in edit mode', async () => {
  jest.spyOn(Router, 'useParams').mockReturnValue({ id: '1' });
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
  jest.spyOn(Router, 'useParams').mockReturnValue({ id: undefined });
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
