import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { MyAccount } from './MyAccount';
import { MY_ACCOUNT_MOCKS } from './MyAccount.test.helper';

const mocks = MY_ACCOUNT_MOCKS;

describe('<MyAccount />', () => {
  test('it should mount', async () => {
    const { getByText, findByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MyAccount />
      </MockedProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    const myAccount = await findByTestId('MyAccount');
    expect(myAccount).toHaveTextContent('Change Password');
  });
});
