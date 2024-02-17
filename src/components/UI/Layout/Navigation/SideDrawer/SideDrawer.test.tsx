import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';

import SideDrawer from './SideDrawer';
import { Menu, getMenus } from 'config/menu';
import { getCurrentUserQuery } from 'mocks/User';
import { setOrganizationServices, setUserSession } from 'services/AuthService';
import { walletBalanceQuery, walletBalanceSubscription } from 'mocks/Organization';
import { SideDrawerContext } from 'context/session';
import { getNotificationCountQuery } from 'mocks/Notifications';

const mocks = [
  getCurrentUserQuery,
  ...walletBalanceQuery,
  ...walletBalanceSubscription,
  getNotificationCountQuery,
];

describe('side drawer testing', () => {
  const component = (
    <SideDrawerContext.Provider value={{ drawerOpen: true, setDrawerOpen: vi.fn() }}>
      <MockedProvider mocks={mocks}>
        <Router>
          <SideDrawer />
        </Router>
      </MockedProvider>
    </SideDrawerContext.Provider>
  );

  it('it should be initialized properly', async () => {
    const { getByTestId } = render(component);
    await waitFor(() => {
      expect(getByTestId('navbar')).toBeInTheDocument();
    });
    // open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);
  });

  it('correct menu items rendered', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","ticketingEnabled":true}');

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));
    const { getAllByTestId } = render(component);
    await waitFor(() => {});
    const sideDrawerMenus = getMenus('sideDrawer', 'Admin');
    // Todo: Fix this test
  });

  it('it should render component in normal mode', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <Router>
          <SideDrawer />
        </Router>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('navbar')).toBeInTheDocument();
    });
    // open menu
    const drawer = screen.getAllByTestId('drawer-button-closed');
    fireEvent.click(drawer[0]);
  });
});
