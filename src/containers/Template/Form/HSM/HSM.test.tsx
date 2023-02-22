import { render, waitFor, within, fireEvent, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import * as Router from 'react-router-dom';

import { HSM } from './HSM';
import { TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  __esModule: true,
}));

const mocks = TEMPLATE_MOCKS;

describe('Edit mode', () => {
  test('HSM form is loaded correctly in edit mode', async () => {
    vi.spyOn(Router, 'useParams').mockReturnValue({ id: '1' });
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router.BrowserRouter>
          <HSM />
        </Router.BrowserRouter>
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByText('Edit HSM Template')).toBeInTheDocument();
    });
  });
});

describe('Add mode', () => {
  test('check for validations for the HSM form', async () => {
    vi.spyOn(Router, 'useParams').mockReturnValue({ id: undefined });
    // vi.doUnmock('react-router-dom');
    // vi.mock('react-router-dom', async () => ({
    //   ...(await vi.importActual<any>('react-router-dom')),
    //   useParams: () => ({ id: undefined }),
    // }));
    const user = userEvent.setup();

    const { getByText, container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router.BrowserRouter>
          <HSM />
        </Router.BrowserRouter>
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
        value:
          'We are not allowing a really long title, and we should trigger validation for this.',
      },
    });
    // we should still have 2 errors
    expect(queryByText('Title is required.')).toBeInTheDocument();
    expect(queryByText('Message is required.')).toBeInTheDocument();
  });
});
