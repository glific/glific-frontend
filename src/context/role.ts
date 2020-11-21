import { sideDrawerMenus, staffManagementMenus } from '../config/menu';
import { getUserSession } from '../services/AuthService';

let role: any[] = [];

const resetRole = () => {
  role = [];
  getRoleBasedAccess();
};

const getUserRole = (): Array<any> => {
  if (!role || role.length === 0) {
    let userRole: any = getUserSession('roles');
    if (userRole) {
      role = userRole;
    } else role = [];
  }
  return role;
};

let sideDrawerMenu: any = [];
let staffManagementMenu: any = [];
let settingMenu: boolean;
let advanceSearch: boolean = false;
let displayUserGroups: boolean = false;
let isManagerRole: boolean = false;

const getRoleBasedAccess = () => {
  // if role not present get role
  if (!role) {
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
