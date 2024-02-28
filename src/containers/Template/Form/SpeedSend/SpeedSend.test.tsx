import 'mocks/matchMediaMock';
import { render, within, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Routes, Route } from 'react-router-dom';
import { SpeedSendList } from 'containers/Template/List/SpeedSendList/SpeedSendList';
import { TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';
import { setUserSession } from 'services/AuthService';
import { SpeedSend } from './SpeedSend';
beforeEach(() => {
  cleanup();
});
const mocks = [...TEMPLATE_MOCKS, ...TEMPLATE_MOCKS];
setUserSession(JSON.stringify({ roles: ['Admin'] }));

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

(window as any).IntersectionObserver = mockIntersectionObserver;

describe('SpeedSend', () => {
  test('cancel button should redirect to SpeedSendlist page', async () => {
    const { container, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<SpeedSend />} />
            <Route path="/speed-send" element={<SpeedSendList />} />
          </Routes>
        </MemoryRouter>
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
  });

  test('should have correct validations ', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<SpeedSend />} />
            <Route path="/speed-send" element={<SpeedSendList />} />
          </Routes>
        </MemoryRouter>
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
    });
  });
});
