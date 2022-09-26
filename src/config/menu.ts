import { GLIFIC_DOCS_URL } from 'config';

// define all the menus in the system
const menus = [
  {
    title: 'Chats',
    path: '/chat',
    icon: 'chat',
    type: 'sideDrawer',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
  // {
  //   title: 'Tags',
  //   path: '/tag',
  //   icon: 'tag',
  //   type: 'sideDrawer',
  //   roles: ['Manager', 'Admin'],
  // },
  {
    title: 'Speed Sends',
    path: '/speed-send',
    icon: 'speed-send',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Flows',
    path: '/flow',
    icon: 'flow',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Triggers',
    path: '/trigger',
    icon: 'trigger',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Searches',
    path: '/search',
    icon: 'search',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Templates',
    path: '/template',
    icon: 'template',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Interactive msg',
    path: '/interactive-message',
    icon: 'interactive-message',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Notifications',
    path: '/notifications',
    icon: 'notification',
    type: 'sideDrawer',
    badge: true,
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Help',
    path: '/help',
    url: GLIFIC_DOCS_URL,
    icon: 'help',
    type: 'sideDrawer',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },

  {
    title: 'Collections',
    path: '/collection',
    type: 'management',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Role Management',
    path: '/role',
    type: 'management',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Staff Management',
    path: '/staff-management',
    type: 'management',
    roles: ['Manager', 'Admin'],
  },
  {
    title: 'Contact management',
    path: '/contact-management',
    type: 'management',
    roles: ['Glific_admin', 'Admin'],
  },
  {
    title: 'Organizations',
    path: '/organizations',
    type: 'management',
    roles: ['Glific_admin'],
  },
  {
    title: 'Consulting',
    path: '/consulting-hours',
    type: 'management',
    roles: ['Glific_admin'],
  },
  {
    title: 'Blocked Contacts',
    path: '/blocked-contacts',
    type: 'management',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'My Profile',
    path: '/user-profile',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'My Account',
    path: '/myaccount',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Logout',
    path: '/logout/user',
    className: 'Danger',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
];

export const getMenus = (menuType = 'sideDrawer', role = 'Staff') =>
  menus
    .filter((menu: any) => menu.type === menuType && menu.roles.includes(role))
    .map((menu: any) => menu);

export default getMenus;
