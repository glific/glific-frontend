import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';

import SideDrawer from './SideDrawer';
import { getMenus } from 'config/menu';
import { getCurrentUserQuery } from 'mocks/User';
import { setOrganizationServices, setUserSession } from 'services/AuthService';
import { walletBalanceQuery, walletBalanceSubscription } from 'mocks/Organization';
import { SideDrawerContext } from 'context/session';
import { getNotificationCountQuery } from 'mocks/Notifications';

const mocks = [getCurrentUserQuery, ...walletBalanceQuery, ...walletBalanceSubscription, getNotificationCountQuery];

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

  describe('AI Evals menu visibility based on aiEvaluationsEnabled flag', () => {
    const getAIToolkitChild = (title: string) =>
      getMenus('sideDrawer', 'Manager')
        .find((m) => m.title === 'AI toolkit')
        ?.children?.find((c) => c.title === title);

    afterEach(() => {
      localStorage.removeItem('organizationServices');
    });

    it('shows the menu item at /ai-evaluations when aiEvaluationsEnabled is true', () => {
      setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: true }));
      expect(getAIToolkitChild('AI Evals')?.path).toBe('/ai-evaluations');
      expect(getAIToolkitChild('AI Evals')?.show).toBeFalsy();
    });

    it('hides the menu item when aiEvaluationsEnabled is false', () => {
      setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: false }));
      expect(getAIToolkitChild('AI Evals')).toBeUndefined();
    });

    it('hides the menu item when aiEvaluationsEnabled is not set', () => {
      setOrganizationServices(JSON.stringify({}));
      expect(getAIToolkitChild('AI Evals')).toBeUndefined();
    });

    it('shows AI Evals v2.0 at /ai-evaluation-v2 when aiEvaluationV2Enabled is true', () => {
      setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: true }));
      expect(getAIToolkitChild('AI Evals v2.0')?.path).toBe('/ai-evaluation-v2');
    });

    it('hides AI Evals v2.0 when aiEvaluationV2Enabled is false', () => {
      setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: false }));
      expect(getAIToolkitChild('AI Evals v2.0')).toBeUndefined();
    });
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
    const drawer = screen.getByTestId('drawer-button-closed');
    fireEvent.click(drawer);
  });
});
