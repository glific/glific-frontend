import { organizationHasDynamicRole } from 'common/utils';
import { ANALYTICS_URL, GLIFIC_DOCS_URL } from 'config';
import { getOrganizationServices } from 'services/AuthService';

const allRoles = ['Staff', 'Manager', 'Admin', 'Dynamic', 'Glific_admin'];
const adminLevel = ['Admin', 'Glific_admin'];
const managerLevel = ['Manager', 'Admin', 'Dynamic', 'Glific_admin'];
const staffLevel = ['Staff', 'Manager', 'Admin', 'Dynamic', 'Glific_admin'];
export interface Menu {
  title: string;
  path: string;
  icon?: string;
  type: string;
  showBadge?: boolean;
  roles: string[];
  url?: string;
  show?: boolean;
  children?: Menu[];
}

// define all the menus in the system
const menus = (): Menu[] => [
  {
    title: 'Chats',
    path: '/chat',
    icon: 'chat',
    type: 'sideDrawer',
    roles: allRoles,
  },
  {
    title: 'WhatsApp Groups',
    path: '/group/chat',
    icon: 'chat',
    type: 'sideDrawer',
    roles: allRoles,
    show: !getOrganizationServices('whatsappGroupEnabled'),
    children: [
      {
        title: 'Group Chats',
        path: '/group/chat',
        icon: 'chat',
        type: 'sideDrawer',
        roles: allRoles,
      },
      {
        title: 'Group Collections',
        path: '/group/collection',
        icon: 'chat',
        type: 'sideDrawer',
        roles: allRoles,
      },
    ],
  },
  {
    title: 'Flows',
    path: '/flow',
    icon: 'flow',
    type: 'sideDrawer',
    children: [
      {
        title: 'Flows',
        path: '/flow',
        icon: 'flow',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Google sheets',
        path: '/sheet-integration',
        icon: 'sheets',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Webhook logs',
        path: '/webhook-logs',
        icon: 'webhook',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Contact variables',
        path: '/contact-fields',
        icon: 'fields',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Support tickets',
        path: '/ticket',
        icon: 'tickets',
        type: 'sideDrawer',
        roles: managerLevel,
        show: !getOrganizationServices('ticketingEnabled'),
      },
    ],
    roles: managerLevel,
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
    roles: managerLevel,
    children: [
      {
        title: 'Interactive msg',
        path: '/interactive-message',
        icon: 'interactive-message',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Templates',
        path: '/template',
        icon: 'template',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Triggers',
        path: '/trigger',
        icon: 'trigger',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Searches',
        path: '/search',
        icon: 'search',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Speed Sends',
        path: '/speed-send',
        icon: 'speed-send',
        type: 'sideDrawer',
        roles: managerLevel,
      },
      {
        title: 'Tags',
        path: '/tag',
        icon: 'tag',
        type: 'sideDrawer',
        roles: managerLevel,
      },
    ],
  },
  {
    title: 'Notifications',
    path: '/notifications',
    icon: 'notification',
    type: 'sideDrawer',
    showBadge: true,
    roles: managerLevel,
  },
  {
    title: 'Manage',
    path: '/collection',
    icon: 'manage',
    type: 'sideDrawer',
    roles: staffLevel,
    children: [
      {
        title: 'Collections',
        path: '/collection',
        type: 'sideDrawer',
        icon: 'collection',
        roles: staffLevel,
      },
      {
        title: 'Staff',
        path: '/staff-management',
        type: 'sideDrawer',
        icon: 'staff',
        roles: ['Manager', 'Admin', 'Glific_admin'],
      },
      {
        title: 'Contacts',
        path: '/contact-management',
        type: 'sideDrawer',
        icon: 'contact',
        roles: adminLevel,
      },
      {
        title: 'Blocked contacts',
        path: '/blocked-contacts',
        type: 'sideDrawer',
        icon: 'block',
        roles: staffLevel,
      },
      {
        title: 'Roles',
        path: '/role',
        type: 'sideDrawer',
        icon: 'speed-send',
        show: !organizationHasDynamicRole(),
        roles: ['Manager', 'Admin', 'Glific_admin'],
      },
      {
        title: 'Organizations',
        path: '/organizations',
        icon: 'organization',
        type: 'sideDrawer',
        roles: ['Glific_admin'],
      },
      {
        title: 'Consulting',
        path: '/consulting-hours',
        type: 'sideDrawer',
        icon: 'consulting',
        roles: ['Glific_admin'],
      },
    ],
  },

  {
    title: 'My Account',
    path: '/myaccount',
    icon: 'account',
    type: 'userAccount',
    roles: staffLevel,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: 'settings',
    type: 'userAccount',
    roles: adminLevel,
  },
  {
    title: 'Logout',
    path: '/logout/user',
    icon: 'logout',
    type: 'userAccount',
    roles: staffLevel,
  },
  {
    title: 'Analytics',
    path: '/analytics',
    url: ANALYTICS_URL,
    icon: 'analytics',
    type: 'sideDrawer',
    roles: staffLevel,
  },
  {
    title: 'Resources',
    path: '/help',
    url: GLIFIC_DOCS_URL,
    icon: 'help',
    type: 'sideDrawer',
    roles: staffLevel,
  },
];

export const getMenus = (menuType = 'sideDrawer', role = 'Staff') =>
  menus()
    .filter((menu) => menu.type === menuType && menu.roles.includes(role))
    .map((menu) => {
      menu.children = menu.children?.filter((menu) => menu.roles.includes(role));
      return menu;
    });

export default getMenus;
