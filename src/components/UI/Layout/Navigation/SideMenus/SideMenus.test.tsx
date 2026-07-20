import { MemoryRouter } from 'react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { resetRolePermissions, setUserRolePermissions } from 'context/role';
import { getNotificationCountQuery, markAllNotificationAsRead } from 'mocks/Notifications';
import { setUserSession, setOrganizationServices } from 'services/AuthService';
import SideMenus from './SideMenus';

const mocks = [getNotificationCountQuery, markAllNotificationAsRead];

const getMenuItem = (title: string) => screen.getAllByTestId('list-item').find((item) => item.textContent === title);

const expectMenuSelected = async (title: string) => {
  await waitFor(() => {
    const item = screen
      .getAllByTestId('list-item')
      .find((el) => el.textContent === title && el.className.match(/SelectedText/));
    expect(item).toBeDefined();
  });
};

const renderSideMenus = (pathname = '/') =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[pathname]}>
        <SideMenus opened={true} />
      </MemoryRouter>
    </MockedProvider>
  );

beforeEach(() => {
  resetRolePermissions();
  setUserSession(JSON.stringify({ roles: [{ label: 'Admin' }] }));
  setUserRolePermissions();
  localStorage.removeItem('organizationServices');
});

test('it should be initialized properly', async () => {
  const { getByTestId } = renderSideMenus();
  await waitFor(() => {
    expect(getByTestId('list')).toBeInTheDocument();
  });
});

test('it should mark notification as read on notification click', async () => {
  const { getAllByTestId, getByTestId } = renderSideMenus();
  await waitFor(() => {
    expect(getByTestId('list')).toBeInTheDocument();
  });
  const listItem = getAllByTestId('list-item');
  expect(listItem[3]).toBeInTheDocument();
  fireEvent.click(listItem[3]);
});

describe('url-based menu selection', () => {
  test('selects a leaf menu item when the url matches', async () => {
    renderSideMenus('/notifications');

    await expectMenuSelected('Notifications');
  });

  test('selects a leaf menu item for nested paths under the same section', async () => {
    renderSideMenus('/chat/conversations/123');

    await expectMenuSelected('Chats');
  });

  test('expands the parent accordion and selects the matching child submenu', async () => {
    renderSideMenus('/sheet-integration');

    await waitFor(() => {
      expect(document.querySelector('.MuiAccordion-root.Mui-expanded')).toBeInTheDocument();
    });
    await expectMenuSelected('Google sheets');
  });

  test('expands the parent accordion and selects the flow child for nested flow paths', async () => {
    renderSideMenus('/flow/42/edit');

    await waitFor(() => {
      expect(document.querySelector('.MuiAccordion-root.Mui-expanded')).toBeInTheDocument();
    });
    await expectMenuSelected('Flows');
  });

  test('updates menu selection when the url changes', async () => {
    renderSideMenus('/chat');

    await expectMenuSelected('Chats');

    fireEvent.click(getMenuItem('Google sheets')!);

    await waitFor(() => {
      expect(document.querySelector('.MuiAccordion-root.Mui-expanded')).toBeInTheDocument();
    });
    await expectMenuSelected('Google sheets');
  });
});

describe('HSM Templates menu routing', () => {
  test('points to the old template page when templateV2Enabled is off', async () => {
    renderSideMenus('/interactive-message');

    await waitFor(() => {
      expect(getMenuItem('HSM Templates')).toBeInTheDocument();
    });
    expect(getMenuItem('HSM Templates')!.closest('a')).toHaveAttribute('href', '/template');
  });

  test('points to the v2 template page when templateV2Enabled is on', async () => {
    setOrganizationServices(JSON.stringify({ templateV2Enabled: true }));
    renderSideMenus('/interactive-message');

    await waitFor(() => {
      expect(getMenuItem('HSM Templates')).toBeInTheDocument();
    });
    expect(getMenuItem('HSM Templates')!.closest('a')).toHaveAttribute('href', '/template-v2');
  });
});
