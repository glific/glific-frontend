import i18n from 'i18next';

export const sideDrawerMenus = [
  {
    title: i18n.t('chats'),
    path: '/chat',
    icon: 'chat',
  },
  {
    title: i18n.t('tags'),
    path: '/tag',
    icon: 'tag',
  },
  {
    title: i18n.t('speedsends'),
    path: '/speed-send',
    icon: 'speed-send',
  },
  {
    title: i18n.t('flows'),
    path: '/flow',
    icon: 'flow',
  },
  {
    title: i18n.t('triggers'),
    path: '/trigger',
    icon: 'trigger',
  },
  {
    title: i18n.t('searches'),
    path: '/search',
    icon: 'search',
  },
  {
    title: i18n.t('templates'),
    path: '/template',
    icon: 'template',
  },
];

export const staffManagementMenus = [
  {
    title: i18n.t('collections'),
    path: '/collection',
  },
  {
    title: i18n.t('staffmanagement'),
    path: '/staff-management',
  },
  {
    title: i18n.t('blockedcontacts'),
    path: '/blocked-contacts',
  },
];

export const userAccountMenus = [
  {
    title: i18n.t('myprofile'),
    path: '/user-profile',
  },
  {
    title: i18n.t('myaccount'),
    path: '/myaccount',
  },
  {
    title: i18n.t('logout'),
    path: '/logout/user',
    className: 'Danger',
  },
];
