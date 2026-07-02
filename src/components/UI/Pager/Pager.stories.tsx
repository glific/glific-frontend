import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Pager from './Pager';
import type { ColumnNames } from 'containers/List/List';
import { hideControls } from '../storybookHelpers';

const meta: Meta<typeof Pager> = {
  title: 'UI/Pager',
  component: Pager,
  tags: ['autodocs'],
  argTypes: {
    totalRows: { control: 'number' },
    collapseOpen: { control: 'boolean' },
    loadingList: { control: 'boolean' },
    showPagination: { control: 'boolean' },
    noItemsText: { control: 'text' },
    ...hideControls(
      'columnNames',
      'data',
      'columnStyles',
      'handleTableChange',
      'tableVals',
      'collapseRow',
      'checkboxSupport'
    ),
  },
};

export default meta;
type Story = StoryObj<typeof Pager>;

const columns: Array<ColumnNames> = [
  { label: 'Name', name: 'name' },
  { label: 'Phone', name: 'phone' },
  { label: 'Status', name: 'status' },
];

const rows = [
  { name: 'Alice Johnson', phone: '+91 98765 43210', status: 'Active' },
  { name: 'Bob Smith', phone: '+91 87654 32109', status: 'Inactive' },
  { name: 'Carol White', phone: '+91 76543 21098', status: 'Active' },
  { name: 'David Brown', phone: '+91 65432 10987', status: 'Active' },
  { name: 'Eva Davis', phone: '+91 54321 09876', status: 'Blocked' },
];

const PagerControlled = (args: any) => {
  const [tableVals, setTableVals] = useState({
    pageNum: 0,
    pageRows: 50,
    sortCol: 'name',
    sortDirection: 'asc' as const,
  });

  return (
    <Pager
      {...args}
      tableVals={tableVals}
      handleTableChange={(key: string, val: any) => setTableVals((prev) => ({ ...prev, [key]: val }))}
    />
  );
};

export const Default: Story = {
  render: (args) => <PagerControlled {...args} />,
  args: {
    columnNames: columns,
    data: rows,
    totalRows: rows.length,
    collapseOpen: false,
    collapseRow: undefined,
  },
};

export const Loading: Story = {
  render: (args) => <PagerControlled {...args} />,
  args: {
    columnNames: columns,
    data: [],
    totalRows: 0,
    collapseOpen: false,
    collapseRow: undefined,
    loadingList: true,
  },
};

export const Empty: Story = {
  render: (args) => <PagerControlled {...args} />,
  args: {
    columnNames: columns,
    data: [],
    totalRows: 0,
    collapseOpen: false,
    collapseRow: undefined,
    noItemsText: 'No contacts found',
  },
};

export const NoPagination: Story = {
  render: (args) => <PagerControlled {...args} />,
  args: {
    columnNames: columns,
    data: rows,
    totalRows: rows.length,
    collapseOpen: false,
    collapseRow: undefined,
    showPagination: false,
  },
};
