import { render, within, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Routes, Route } from 'react-router-dom';

import { SpeedSendList } from 'containers/Template/List/SpeedSendList/SpeedSendList';
import { TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';
import { setUserSession } from 'services/AuthService';
import { SpeedSend } from './SpeedSend';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;
setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('SpeedSend', () => {
  test('cancel button should redirect to SpeedSendlist page', async () => {
    const { container, getByText, unmount } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Routes>
            <Route path="/" element={<SpeedSend />} />
            <Route path="/speed-send" element={<SpeedSendList />} />
          </Routes>
        </Router>
      </MockedProvider>
    );

    await waitFor(() => {
      const { queryByText } = within(container.querySelector('form') as HTMLElement);
      const button = queryByText('Cancel') as HTMLButtonElement;
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(getByText('Speed sends')).toBeInTheDocument();
    });
    unmount();
  });

  test('save button should add a new template', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Routes>
            <Route path="/" element={<SpeedSend />} />
            <Route path="/speed-send" element={<SpeedSendList />} />
          </Routes>
        </Router>
      </MockedProvider>
    );

    await waitFor(() => {
      fireEvent.change(container.querySelector('input[name="label"]') as HTMLInputElement, {
        target: { value: 'new Template' },
      });
    });

    const { queryByText } = within(container.querySelector('form') as HTMLElement);
    await waitFor(() => {
      const button = queryByText('Save') as HTMLButtonElement;
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(queryByText('Message is required.')).toBeInTheDocument();
      const { getByText } = within(container.querySelector('tbody') as HTMLElement);
      expect(getByText('Good message')).toBeInTheDocument();
    });
  });
});
