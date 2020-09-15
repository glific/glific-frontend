import React from 'react';
import { sideDrawerMenus, staffManagementMenus } from '../config/menu';

export const RoleContext = React.createContext({
  role: [],
  setRole: (value: any) => {
    setUserRole(value);
  },
});

let role: any[] = [];
const setUserRole = (type: any) => {
  role = type;
  getRoleBasedAccess();
};

const getUserRole = () => {
  return role;
};

let sideDrawerMenu: any = [];
let staffManagementMenu: any = [];
let settingMenu: boolean = false;
let advanceSearch: boolean = false;
let displayUserGroups: boolean = false;
let isManagerRole: boolean = false;

const getRoleBasedAccess = () => {
  if (role.includes('Staff')) {
    sideDrawerMenu = [
      {
        title: 'Chats',
        path: '/chat',
        icon: 'chat',
      },
    ];

    staffManagementMenu = [
      {
        title: 'Groups',
        path: '/group',
      },
    ];
  }

  if (role.includes('Manager') || role.includes('Admin')) {
    sideDrawerMenu = sideDrawerMenus;
    staffManagementMenu = staffManagementMenus;

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

export const getStaffManagementMenus = () => {
  return staffManagementMenu;
};

export {
  setUserRole,
  getUserRole,
  getRoleBasedAccess,
  settingMenu,
  advanceSearch,
  displayUserGroups,
  isManagerRole,
};
