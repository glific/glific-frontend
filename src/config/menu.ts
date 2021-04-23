import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next.use(LanguageDetector);

// define all the menus in the system
const menus = [
  {
    title: i18next.t('Chats'),
    path: '/chat',
    icon: 'chat',
    type: 'sideDrawer',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: i18next.t('Tags'),
    path: '/tag',
    icon: 'tag',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: i18next.t('Speed Sends'),
    path: '/speed-send',
    icon: 'speed-send',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: i18next.t('Flows'),
    path: '/flow',
    icon: 'flow',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: i18next.t('Triggers (Beta)'),
    path: '/trigger',
    icon: 'trigger',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: i18next.t('Searches'),
    path: '/search',
    icon: 'search',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: i18next.t('Templates'),
    path: '/template',
    icon: 'template',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin'],
  },
  {
    title: i18next.t('Collections'),
    path: '/collection',
    type: 'staffManagement',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: i18next.t('Staff Management'),
    path: '/staff-management',
    type: 'staffManagement',
    roles: ['Manager', 'Admin'],
  },
  {
    title: i18next.t('Blocked Contacts'),
    path: '/blocked-contacts',
    type: 'staffManagement',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: i18next.t('My Profile'),
    path: '/user-profile',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: i18next.t('My Account'),
    path: '/myaccount',
    type: 'userAccount',
    roles: ['Staff', 'Manager', 'Admin'],
  },
  {
    title: i18next.t('Logout'),
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
