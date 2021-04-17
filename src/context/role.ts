import { getMenus } from '../config/menu';
import { getUserSession } from '../services/AuthService';

let role: any[] = [];
let sideDrawerMenu: any = [];
let staffManagementMenu: any = [];

// we are correctly using mutable export bindings hence making an exception for below
/* eslint-disable */
let settingMenu: boolean = false;
let advanceSearch: boolean = false;
let displayUserCollections: boolean = false;
let isManagerRole: boolean = false;
/* eslint-enable */

const getUserRole = (): Array<any> => {
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
    sideDrawerMenu = getMenus('sideDrawer');
    staffManagementMenu = getMenus('staffManagement');

    settingMenu = false;
  }

  if (role.includes('Manager') || role.includes('Admin')) {
    // gettting menus for Manager as menus are same as in Admin
    sideDrawerMenu = getMenus('sideDrawer', 'Manager');
    staffManagementMenu = getMenus('staffManagement', 'Manager');
    advanceSearch = true;
    displayUserCollections = true;
    settingMenu = true;

    if (role.includes('Manager')) {
      settingMenu = false;
      isManagerRole = true;
    }
  }

  // reset on logout
  if (role.length === 0) {
    settingMenu = false;
    advanceSearch = false;
    displayUserCollections = false;
    isManagerRole = false;
  }

  return sideDrawerMenu;
};

const resetRole = () => {
  role = [];
  getRoleBasedAccess();
};

export const getStaffManagementMenus = () => staffManagementMenu;

export {
  getUserRole,
  getRoleBasedAccess,
  settingMenu,
  advanceSearch,
  displayUserCollections,
  isManagerRole,
  resetRole,
};
