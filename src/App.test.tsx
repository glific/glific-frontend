import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { waitFor, render } from '@testing-library/react';
import { vi, describe, it } from 'vitest';

import App from 'App';
import { CONVERSATION_MOCKS } from 'mocks/Chat';

const mocks = CONVERSATION_MOCKS;
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

global.fetch = vi.fn();

const app = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  </MockedProvider>
);

vi.mock('routes/AuthenticatedRoute/AuthenticatedRoute', () => ({
  default: () => <div>Authenticated route subscription</div>,
  AuthenticatedRoute: () => <div>Chat subscription</div>,
}));

describe('<App /> ', () => {
  it('it should render <Login /> component by default', async () => {
    mockedAxios.post.mockImplementation(() => Promise.resolve({}));
    const { getByTestId } = render(app);

    await waitFor(() => {
      expect(getByTestId('AuthContainer')).toBeInTheDocument();
    });
  });

  it('it should render <App /> component correctly', async () => {
    const { container } = render(app);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
