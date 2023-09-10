import { ANALYTICS_URL, GLIFIC_DOCS_URL } from 'config';
import { getOrganizationServices } from 'services/AuthService';

export interface Menu {
  title: string;
  path: string;
  icon?: string;
  type: string;
  roles: string[];
  url?: string;
  show?: boolean;
  subMenu?: Menu[];
}

// define all the menus in the system
const menus: Menu[] = [
  {
    title: 'Chats',
    path: '/chat',
    icon: 'chat',
    type: 'sideDrawer',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Flows',
    path: '/flow',
    icon: 'flow',
    type: 'sideDrawer',
    subMenu: [
      {
        title: 'Flows',
        path: '/flow',
        icon: 'flow',
        type: 'sideDrawer',
        roles: ['Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Google sheets',
        path: '/sheet-integration',
        icon: 'sheets',
        type: 'sideDrawer',
        roles: ['Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Webhook logs',
        path: '/webhook-logs',
        icon: 'webhook',
        type: 'sideDrawer',
        roles: ['Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Contact variables',
        path: '/contact-fields',
        icon: 'fields',
        type: 'sideDrawer',
        roles: ['Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Support tickets',
        path: '/ticket',
        icon: 'tickets',
        type: 'sideDrawer',
        roles: ['Manager', 'Admin', 'Dynamic'],
        show: !getOrganizationServices('ticketingEnabled'),
      },
    ],
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Support tickets',
    path: '/ticket',
    icon: 'tickets',
    type: 'sideDrawer',
    roles: ['Staff'],
    show: !getOrganizationServices('ticketingEnabled'),
  },
  {
    title: 'Quick tools',
    path: '/interactive-message',
    icon: 'speed-send',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
    subMenu: [
      {
        title: 'Interactive msg',
        path: '/interactive-message',
        icon: 'interactive-message',
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
        title: 'Speed Sends',
        path: '/speed-send',
        icon: 'speed-send',
        type: 'sideDrawer',
        roles: ['Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Tags',
        path: '/tag',
        icon: 'tag',
        type: 'sideDrawer',
        roles: ['Manager', 'Admin', 'Dynamic'],
      },
    ],
  },
  {
    title: 'Notifications',
    path: '/notifications',
    icon: 'notification',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Manage',
    path: '/collection',
    icon: 'manage',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
    subMenu: [
      {
        title: 'Collections',
        path: '/collection',
        type: 'management',
        icon: 'collection',
        roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Staff',
        path: '/staff-management',
        type: 'management',
        icon: 'staff',
        roles: ['Manager', 'Admin'],
      },
      {
        title: 'Contacts',
        path: '/contact-management',
        type: 'management',
        icon: 'contact',
        roles: ['Admin'],
      },
      {
        title: 'Blocked contacts',
        path: '/blocked-contacts',
        type: 'management',
        icon: 'block',
        roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Roles',
        path: '/role',
        type: 'management',
        icon: 'speed-send',
        roles: ['Manager', 'Admin'],
      },
    ],
  },

  {
    title: 'Account',
    path: '/user-profile',
    icon: 'profile',
    type: 'sideDrawer',
    roles: ['Manager', 'Admin', 'Dynamic'],
    subMenu: [
      {
        title: 'My Profile',
        path: '/user-profile',
        type: 'userAccount',
        icon: 'profile',
        roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'My Account',
        path: '/myaccount',
        icon: 'account',
        type: 'userAccount',
        roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
      },
      {
        title: 'Settings',
        path: '/settings',
        icon: 'settings',
        type: 'userAccount',
        roles: ['Admin'],
      },
      {
        title: 'Logout',
        path: '/logout/user',
        icon: 'logout',
        type: 'userAccount',
        roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
      },
    ],
  },
  {
    title: 'Admin',
    path: '/organizations',
    icon: 'manage',
    type: 'sideDrawer',
    roles: ['Glific_admin'],
    subMenu: [
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
        title: 'Contacts',
        path: '/contact-management',
        type: 'management',
        icon: 'contact',
        roles: ['Glific_admin'],
      },
    ],
  },

  {
    title: 'Analytics',
    path: '/analytics',
    url: ANALYTICS_URL,
    icon: 'analytics',
    type: 'sideDrawer',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
  {
    title: 'Resources',
    path: '/help',
    url: GLIFIC_DOCS_URL,
    icon: 'help',
    type: 'sideDrawer',
    roles: ['Staff', 'Manager', 'Admin', 'Dynamic'],
  },
];

export const getMenus = (menuType = 'sideDrawer', role = 'Staff') =>
  menus.filter((menu) => menu.type === menuType && menu.roles.includes(role)).map((menu) => menu);

export default getMenus;
