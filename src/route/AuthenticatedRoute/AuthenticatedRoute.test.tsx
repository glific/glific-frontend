import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import AuthenticatedRoute from './AuthenticatedRoute';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { walletBalanceQuery, walletBalanceSubscription } from '../../mocks/Organization';
import { setUserSession } from '../../services/AuthService';
import { CONVERSATION_MOCKS } from '../../mocks/Chat';
import * as Chat from '../../containers/Chat/Chat';

const mocks = [...walletBalanceQuery, ...walletBalanceSubscription, ...CONVERSATION_MOCKS];

describe('<AuthenticatedRoute />', () => {
  test('it should render', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <BrowserRouter>
          <AuthenticatedRoute />
        </BrowserRouter>
      </MockedProvider>
    );

    const spy = jest.spyOn(Chat, 'Chat');
    spy.mockImplementation((props: any) => {
      return <div data-testid="chat"></div>;
    });

    await waitFor(() => {
      expect(getByTestId('app')).toBeInTheDocument();
    });
  });
});
