import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, fireEvent } from '@testing-library/react';
import { waitFor } from '@testing-library/react';

import SideDrawer from './SideDrawer';
import { getMenus } from 'config/menu';
import { getCurrentUserQuery } from 'mocks/User';
import { setUserSession } from 'services/AuthService';
import { walletBalanceQuery, walletBalanceSubscription } from 'mocks/Organization';

const mocks = [getCurrentUserQuery, ...walletBalanceQuery, ...walletBalanceSubscription];

describe('side drawer testing', () => {
  const component = (
    <MockedProvider mocks={mocks}>
      <Router>
        <SideDrawer fullOpen={true} setFullOpen={jest.fn()} />
      </Router>
    </MockedProvider>
  );

  it('it should be initialized properly', async () => {
    const { getByTestId } = render(component);
    await waitFor(() => {
      expect(getByTestId('navbar')).toBeInTheDocument();
    });
  });

  it('should open bottom menus', async () => {
    const { getByTestId, getAllByTestId } = render(component);
    fireEvent.click(getByTestId('bottom-menu'));
    await waitFor(() => {});
    expect(getAllByTestId('MenuItem')[0]).toHaveTextContent('My Profile');
  });

  it('correct menu items rendered', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getAllByTestId } = render(component);
    await waitFor(() => {});
    let menuItems = getAllByTestId('list-item');
    const sideDrawerMenus = getMenus('sideDrawer', 'Admin');
    for (let i = 0; i < menuItems.length / 2; i++) {
      expect(getAllByTestId('list-item')[i]).toHaveTextContent(sideDrawerMenus[i].title);
    }
  });

  it('should contain a help button', async () => {
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getByTestId } = render(component);
    await waitFor(() => {});
    expect(getByTestId('helpButton')).toBeInTheDocument();
  });
});
