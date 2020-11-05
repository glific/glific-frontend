import { sideDrawerMenus, staffManagementMenus } from '../config/menu';

let role: any[] = [];
export const setUserRole = (type: any) => {
  localStorage.setItem('role', JSON.stringify(type));
  role = type;
  getRoleBasedAccess();
};

const getUserRole = () => {
  if (!role || role.length === 0) {
    let userRole: any = localStorage.getItem('role');
    if (userRole) {
      role = userRole;
    }
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
    getUserRole();
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
};
