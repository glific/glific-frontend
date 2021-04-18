import { getMenus } from '../config/menu';
import { getUserSession } from '../services/AuthService';

let role: any[] = [];
let sideDrawerMenu: any = [];
let staffManagementMenu: any = [];

// we are correctly using mutable export bindings hence making an exception for below
/* eslint-disable */
let settingMenu: boolean = false;
let manageSavedSearches: boolean = false;
let displayUserCollections: boolean = false;
let isManagerRole: boolean = false;
/* eslint-enable */

// function to get the logged in user role
export const getUserRole = (): Array<any> => {
  if (!role || role.length === 0) {
    const userRole: any = getUserSession('roles');
    if (userRole) {
      role = userRole;
    } else role = [];
  }
  return role;
};

// function to set the user permissions based on the role
export const setUserRolePermissions = () => {
  // if role not present get role
  if (!role || role.length === 0) {
    role = getUserRole();
  }

  if (role && role.includes('Staff')) {
    sideDrawerMenu = getMenus('sideDrawer');
    staffManagementMenu = getMenus('staffManagement');
  }

  if ((role && role.includes('Manager')) || role.includes('Admin')) {
    // gettting menus for Manager as menus are same as in Admin
    sideDrawerMenu = getMenus('sideDrawer', 'Manager');
    staffManagementMenu = getMenus('staffManagement', 'Manager');

    if (role.includes('Manager')) {
      isManagerRole = true;
    } else {
      manageSavedSearches = true;
      displayUserCollections = true;
      settingMenu = true;
    }
  }
};

export const resetRolePermissions = () => {
  role = [];
  manageSavedSearches = false;
  settingMenu = false;
  displayUserCollections = false;
  isManagerRole = false;
};

// menus for sideDrawer
export const getSideDrawerMenus = () => sideDrawerMenu;

// staff management menus
export const getStaffManagementMenus = () => staffManagementMenu;

// users menus
export const getUserAccountMenus = () => getMenus('userAccount');

// function to return more granular permissions based on the roles
export const getRolePermissions = () => {
  const userRolePermissions: any = [];

  userRolePermissions.manageSavedSearches = manageSavedSearches;

  return userRolePermissions;
};
export { settingMenu, displayUserCollections, isManagerRole };
