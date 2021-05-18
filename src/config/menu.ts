// define all the menus in the system
const menus = [
  {
    title: 'Chats',
    path: '/chat',
    icon: 'chat',
    type: 'sideDrawer',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: 'Tags',
    path: '/tag',
    icon: 'tag',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Speed Sends',
    path: '/speed-send',
    icon: 'speed-send',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Flows',
    path: '/flow',
    icon: 'flow',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Triggers (Beta)',
    path: '/trigger',
    icon: 'trigger',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Searches',
    path: '/search',
    icon: 'search',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Templates',
    path: '/template',
    icon: 'template',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Collections',
    path: '/collection',
    type: 'staffManagement',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: 'Staff Management',
    path: '/staff-management',
    type: 'staffManagement',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Organizations',
    path: '/organizations',
    type: 'staffManagement',
    roles: ['Glific_admin'],
  },
  {
    title: 'Consulting',
    path: '/consulting-hours',
    type: 'staffManagement',
    roles: ['Glific_admin'],
  },
  {
    title: 'Blocked Contacts',
    path: '/blocked-contacts',
    type: 'staffManagement',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: 'My Profile',
    path: '/user-profile',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: 'My Account',
    path: '/myaccount',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: 'Logout',
    path: '/logout/user',
    className: 'Danger',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin'],
  },
];

export const getMenus = (menuType = 'sideDrawer', role = 'Staff') =>
  menus
    .filter((menu: any) => menu.type === menuType && menu.roles.includes(role))
    .map((menu: any) => menu);

export default getMenus;
