export const userAccountMenus = [
  {
    title: 'My Profile',
    path: '/user-profile',
  },
  {
    title: 'My Account',
    path: '/myaccount',
  },
  {
    title: 'Logout',
    path: '/logout/user',
    className: 'Danger',
  },
];

const menus = [
  {
    title: 'Chats',
    path: '/chat',
    icon: 'chat',
    type: 'sideDrawer',
  },
  {
    title: 'Tags',
    path: '/tag',
    icon: 'tag',
    type: 'sideDrawer',
  },
  {
    title: 'Speed Sends',
    path: '/speed-send',
    icon: 'speed-send',
    type: 'sideDrawer',
  },
  {
    title: 'Flows',
    path: '/flow',
    icon: 'flow',
    type: 'sideDrawer',
  },
  {
    title: 'Triggers (Beta)',
    path: '/trigger',
    icon: 'trigger',
    type: 'sideDrawer',
  },
  {
    title: 'Searches',
    path: '/search',
    icon: 'search',
    type: 'sideDrawer',
  },
  {
    title: 'Templates',
    path: '/template',
    icon: 'template',
    type: 'sideDrawer',
  },
  {
    title: 'Collections',
    path: '/collection',
    type: 'staffManagement',
  },
  {
    title: 'Staff Management',
    path: '/staff-management',
    type: 'staffManagement',
  },
  {
    title: 'Blocked Contacts',
    path: '/blocked-contacts',
    type: 'staffManagement',
  },
  {
    title: 'My Profile',
    path: '/user-profile',
    type: 'userAccount',
  },
  {
    title: 'My Account',
    path: '/myaccount',
    type: 'userAccount',
  },
  {
    title: 'Logout',
    path: '/logout/user',
    className: 'Danger',
    type: 'userAccount',
  },
];

export const getMenus = (menuType = 'sideDrawer') =>
  menus.filter((menu: any) => menu.type === menuType).map((menu: any) => menu);
