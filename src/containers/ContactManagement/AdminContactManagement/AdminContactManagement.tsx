import { Heading } from 'containers/Form/FormLayout';
import React from 'react';
import { listIcon } from '../SuperAdminContactManagement/SuperAdminContactManagement';

export interface AdminContactManagementProps {}

export const AdminContactManagement: React.SFC<AdminContactManagementProps> = () => (
  <div>
    <Heading icon={listIcon} formTitle="Contact Management" />
  </div>
);

export default AdminContactManagement;
