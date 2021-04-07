import i18n from 'i18next';

export const sideDrawerMenus = [
  {
    title: i18n.t('menu.chats'),
    path: '/chat',
    icon: 'chat',
  },
  {
    title: i18n.t('menu.tags'),
    path: '/tag',
    icon: 'tag',
  },
  {
    title: i18n.t('menu.speedsends'),
    path: '/speed-send',
    icon: 'speed-send',
  },
  {
    title: i18n.t('menu.flows'),
    path: '/flow',
    icon: 'flow',
  },
  {
    title: i18n.t('menu.triggers'),
    path: '/trigger',
    icon: 'trigger',
  },
  {
    title: i18n.t('menu.searches'),
    path: '/search',
    icon: 'search',
  },
  {
    title: i18n.t('menu.templates'),
    path: '/template',
    icon: 'template',
  },
];

export const staffManagementMenus = [
  {
    title: i18n.t('menu.collections'),
    path: '/collection',
  },
  {
    title: i18n.t('menu.staffmanagement'),
    path: '/staff-management',
  },
  {
    title: i18n.t('menu.blockedcontacts'),
    path: '/blocked-contacts',
  },
];

export const userAccountMenus = [
  {
    title: i18n.t('menu.myprofile'),
    path: '/user-profile',
  },
  {
    title: i18n.t('menu.myaccount'),
    path: '/myaccount',
  },
  {
    title: i18n.t('menu.logout'),
    path: '/logout/user',
    className: 'Danger',
  },
];
