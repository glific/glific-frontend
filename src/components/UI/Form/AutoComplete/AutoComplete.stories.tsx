import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AutoComplete } from './AutoComplete';

const meta: Meta<typeof AutoComplete> = {
  title: 'UI/Form/AutoComplete',
  component: AutoComplete,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AutoComplete>;

const tagOptions = [
  { id: '1', label: 'Important' },
  { id: '2', label: 'Follow Up' },
  { id: '3', label: 'Urgent' },
  { id: '4', label: 'Resolved' },
  { id: '5', label: 'Pending' },
];

const MultiSelectControlled = (args: any) => {
  const [value, setValue] = useState<any[]>([]);
  return (
    <AutoComplete
      {...args}
      field={{ name: 'tags', value }}
      form={{ setFieldValue: (_: string, val: any) => setValue(val), touched: {}, errors: {} }}
    />
  );
};

const SingleSelectControlled = (args: any) => {
  const [value, setValue] = useState<any>(null);
  return (
    <AutoComplete
      {...args}
      field={{ name: 'tag', value }}
      form={{ setFieldValue: (_: string, val: any) => setValue(val), touched: {}, errors: {} }}
    />
  );
};

export const MultiSelect: Story = {
  render: (args) => <MultiSelectControlled {...args} />,
  args: {
    options: tagOptions,
    optionLabel: 'label',
    placeholder: 'Select tags',
    multiple: true,
  },
};

export const SingleSelect: Story = {
  render: (args) => <SingleSelectControlled {...args} />,
  args: {
    options: tagOptions,
    optionLabel: 'label',
    placeholder: 'Select a tag',
    multiple: false,
  },
};

export const WithHelperText: Story = {
  render: (args) => <MultiSelectControlled {...args} />,
  args: {
    options: tagOptions,
    optionLabel: 'label',
    placeholder: 'Select tags',
    helperText: 'Tags help categorise conversations.',
    multiple: true,
  },
};

export const Disabled: Story = {
  render: (args) => <MultiSelectControlled {...args} />,
  args: {
    options: tagOptions,
    optionLabel: 'label',
    placeholder: 'Select tags',
    disabled: true,
    multiple: true,
  },
};

export const WithError: Story = {
  render: (args) => (
    <AutoComplete
      {...args}
      field={{ name: 'tags', value: [] }}
      form={{ setFieldValue: () => {}, touched: { tags: true }, errors: { tags: 'At least one tag is required' } }}
    />
  ),
  args: {
    options: tagOptions,
    optionLabel: 'label',
    placeholder: 'Select tags',
    multiple: true,
  },
};
