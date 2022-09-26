import React from 'react';

import { getUserRole } from 'context/role';
import SuperAdminContactManagement from './SuperAdminContactManagement/SuperAdminContactManagement';
import AdminContactManagement from './AdminContactManagement/AdminContactManagement';

export interface ContactManagementProps {}

export const ContactManagement: React.SFC<ContactManagementProps> = () => {
  const role = getUserRole();
  if (role.includes('Glific_admin')) {
    return <SuperAdminContactManagement />;
  }

  if (role.includes('Admin')) {
    return <AdminContactManagement />;
  }

  return <div>Unauthorized access</div>;
};

export default ContactManagement;
