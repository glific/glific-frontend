import React from 'react';
import DataTable from 'react-data-table-component';

export interface ClientTableProps {
  columns: any;
  data: any;
}

export const ClientTable: React.SFC<ClientTableProps> = (props) => {
  return <DataTable columns={props.columns} data={props.data} noHeader pagination />;
};
