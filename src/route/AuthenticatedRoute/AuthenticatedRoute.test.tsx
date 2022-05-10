import { Suspense } from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { walletBalanceQuery, walletBalanceSubscription } from 'mocks/Organization';
import { setUserSession } from 'services/AuthService';
import { CONVERSATION_MOCKS } from 'mocks/Chat';
import * as Chat from 'containers/Chat/Chat';
import * as ChatSubscription from 'containers/Chat/ChatSubscription/ChatSubscription';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import AuthenticatedRoute from './AuthenticatedRoute';

jest.mock('axios');

const mocks = [...walletBalanceQuery, ...walletBalanceSubscription, ...CONVERSATION_MOCKS];
window.HTMLElement.prototype.scrollIntoView = function () {};
describe('<AuthenticatedRoute />', () => {
  test('it should render', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <AuthenticatedRoute />
          </Suspense>
        </BrowserRouter>
      </MockedProvider>
    );

    const spy = jest.spyOn(Chat, 'Chat');
    spy.mockImplementation(() => {
      return <div data-testid="chat"></div>;
    });

    const spyOnSubscription = jest.spyOn(ChatSubscription, 'ChatSubscription');
    spyOnSubscription.mockImplementation(() => {
      return <div data-testid="chatSubscription"></div>;
    });

    await waitFor(() => {
      expect(getByTestId('app')).toBeInTheDocument();
    });
  });
});
