import React from 'react';
import { Drawer, ListItem } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, fireEvent } from '@testing-library/react';
import { wait, waitFor } from '@testing-library/react';

import SideDrawer from './SideDrawer';
import { sideDrawerMenus } from '../../../../../config/menu';
import { getRoleBasedAccess } from '../../../../../context/role';
import { getCurrentUserQuery } from '../../../../../mocks/User';
import { setUserSession } from '../../../../../services/AuthService';

const mocks = [getCurrentUserQuery];

describe('side drawer testing', () => {
  const component = (
    <MockedProvider mocks={mocks}>
      <Router>
        <SideDrawer />
      </Router>
    </MockedProvider>
  );

  it('it should be initialized properly', async () => {
    const { getByTestId } = render(component);
    await waitFor(() => {
      expect(getByTestId('navbar')).toBeInTheDocument();
    });
  });

  test('opening and closing of side drawer', () => {
    const { getAllByTestId, queryByTestId } = render(component);
    fireEvent.click(getAllByTestId('drawer-button')[0]);
    expect(queryByTestId('drawer-button')).toBe(null);
    fireEvent.click(getAllByTestId('drawer-button-closed')[0]);
    expect(getAllByTestId('drawer-button')[0]).toBeInTheDocument();
  });

  it('should open bottom menus', () => {
    const { getByTestId, getAllByTestId } = render(component);
    fireEvent.click(getByTestId('bottom-menu'));
    expect(getAllByTestId('MenuItem')[0]).toHaveTextContent('My Profile');
  });

  it('correct menu items rendered', () => {
    setUserSession('{"roles":["Admin"]}');
    const { getAllByTestId } = render(component);
    let menuItems = getAllByTestId('list-item');
    for (let i = 0; i < menuItems.length / 2; i++) {
      expect(getAllByTestId('list-item')[i]).toHaveTextContent(sideDrawerMenus[i].title);
    }
  });
});
