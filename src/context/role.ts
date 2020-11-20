import { sideDrawerMenus, staffManagementMenus } from '../config/menu';
import { getUserSession } from '../services/AuthService';

let role: any[] = [];
let sideDrawerMenu: any = [];
let staffManagementMenu: any = [];

// we are correctly using mutable export bindings hence making an exception for below
/* eslint-disable */
let settingMenu: boolean = false;
let advanceSearch: boolean = false;
let displayUserGroups: boolean = false;
let isManagerRole: boolean = false;
/* eslint-enable */

const getUserRole = () => {
  if (!role || role.length === 0) {
    const userRole: any = getUserSession('roles');
    if (userRole) {
      role = userRole;
    } else role = [];
  }
  return role;
};

const getRoleBasedAccess = () => {
  // if role not present get role
  if (!role || role.length === 0) {
    role = getUserRole();
  }

  if (role && role.includes('Staff')) {
    sideDrawerMenu = [
      {
        title: 'Chats',
        path: '/chat',
        icon: 'chat',
      },
    ];

    staffManagementMenu = staffManagementMenus.filter(
      (obj: { path: string }) => obj.path !== '/staff-management'
    );

    settingMenu = false;
  }

  if (role.includes('Manager') || role.includes('Admin')) {
    sideDrawerMenu = sideDrawerMenus;
    staffManagementMenu = staffManagementMenus;
    settingMenu = false;

    if (role.includes('Admin')) settingMenu = true;
    if (role.includes('Manager')) isManagerRole = true;

    advanceSearch = true;
    displayUserGroups = true;
  }

  // reset on logout
  if (role.length === 0) {
    settingMenu = false;
    advanceSearch = false;
    displayUserGroups = false;
    isManagerRole = false;
  }

  return sideDrawerMenu;
};

const resetRole = () => {
  role = [];
  getRoleBasedAccess();
};

export const getStaffManagementMenus = () => {
  return staffManagementMenu;
};

export {
  getUserRole,
  getRoleBasedAccess,
  settingMenu,
  advanceSearch,
  displayUserGroups,
  isManagerRole,
  resetRole,
};
