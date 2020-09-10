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
  console.log('set', type);
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

    advanceSearch = true;
  }

  return sideDrawerMenu;
};

export const getStaffManagementMenus = () => {
  return staffManagementMenu;
};

export { setUserRole, getUserRole, getRoleBasedAccess, settingMenu, advanceSearch };
