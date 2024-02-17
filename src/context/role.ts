import { organizationHasDynamicRole } from 'common/utils';
import { Menu, getMenus } from 'config/menu';
import { getUserSession } from 'services/AuthService';

let role: any[] = [];
let sideDrawerMenu: Menu[] = [];
let userAccountMenu: Menu[] = [];

// we are correctly using mutable export bindings hence making an exception for below
/* eslint-disable */
let manageSavedSearches: boolean = false;
let manageCollections: boolean = false;
/* eslint-enable */

// function to get the logged in user role
export const getUserRole = (): Array<any> => {
  if (!role || role.length === 0) {
    const userRoles: any = getUserSession('roles');

    if (userRoles) {
      role = userRoles.map((userRole: any) => userRole.label);
    } else role = [];
  }
  return role;
};

export const checkDynamicRole = () => {
  if (!role || role.length === 0) {
    role = getUserRole();
  }

  for (let i = 0; i < role.length; i += 1)
    if (!['Admin', 'Manager', 'Staff', 'None', 'Glific_admin'].includes(role[i])) {
      return true;
    }

  return false;
};

// function to set the user permissions based on the role
export const setUserRolePermissions = () => {
  // if role not present get role
  if (!role || role.length === 0) {
    role = getUserRole();
  }

  const hasDynamicRole = checkDynamicRole();

  if (role && hasDynamicRole) {
    sideDrawerMenu = getMenus('sideDrawer', 'Dynamic');
    userAccountMenu = getMenus('userAccount', 'Dynamic');
  }

  if (role && role.includes('Staff')) {
    sideDrawerMenu = getMenus('sideDrawer');
    userAccountMenu = getMenus('userAccount');
  }

  if ((role && role.includes('Manager')) || role.includes('Admin')) {
    // gettting menus for Manager as menus are same as in Admin
    sideDrawerMenu = getMenus('sideDrawer', 'Manager');
    userAccountMenu = getMenus('userAccount', 'Manager');

    if (role.includes('Admin')) {
      manageSavedSearches = true;
      manageCollections = true;
      userAccountMenu = getMenus('userAccount', 'Admin');
    }
  }

  if (role && role.includes('Glific_admin')) {
    /**
     * Glific admin will have additional menus along with admin menus
     */
    sideDrawerMenu = getMenus('sideDrawer', 'Glific_admin');

    userAccountMenu = getMenus('userAccount', 'Admin');

    manageSavedSearches = true;
    manageCollections = true;
  }
};

// function to reset user permissions
export const resetRolePermissions = () => {
  role = [];
  manageSavedSearches = false;
  manageCollections = false;
};

// menus for sideDrawer
export const getSideDrawerMenus = () => {
  // get the permissioned menus
  setUserRolePermissions();
  return sideDrawerMenu;
};

// staff userAccount menus
export const getUserAccountMenus = () => {
  // get the permissioned menus
  setUserRolePermissions();
  return userAccountMenu;
};

// function to return more granular permissions based on the roles
export const getUserRolePermissions = () => {
  const userRolePermissions: any = [];

  // set permission values
  userRolePermissions.manageSavedSearches = manageSavedSearches;
  userRolePermissions.manageCollections = manageCollections;

  return userRolePermissions;
};
