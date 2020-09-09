import React from 'react';
import { sideDrawerMenus, staffManagementMenus } from '../config/menu';

export const RoleContext = React.createContext({
  role: [],
  setRole: (value: any) => {
    console.log('Setrole', value);
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
    settingMenu = true;
    sideDrawerMenu = sideDrawerMenus;
    staffManagementMenu = staffManagementMenus;
  }

  return sideDrawerMenu;
};

export const getStaffManagementMenus = () => {
  return staffManagementMenu;
};

export { setUserRole, getUserRole, getRoleBasedAccess, settingMenu };
