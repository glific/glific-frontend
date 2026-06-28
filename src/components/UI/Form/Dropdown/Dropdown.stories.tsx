import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'UI/Form/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const languageOptions = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'mr', label: 'Marathi' },
  { id: 'ta', label: 'Tamil' },
];

const Controlled = (args: any) => {
  const [value, setValue] = useState('');
  return (
    <Dropdown
      {...args}
      field={{ name: 'dropdown', value, onChange: (e: any) => setValue(e.target.value) }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    placeholder: 'Select Language',
    options: languageOptions,
  },
};

export const WithHelperText: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    placeholder: 'Select Language',
    options: languageOptions,
    helperText: 'Choose the language for this template',
  },
};

export const WithError: Story = {
  render: (args) => (
    <Dropdown
      {...args}
      field={{ name: 'lang', value: '', onChange: () => {} }}
      form={{ touched: { lang: true }, errors: { lang: 'Language is required' } }}
    />
  ),
  args: {
    placeholder: 'Select Language',
    options: languageOptions,
  },
};

export const Disabled: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    placeholder: 'Select Language',
    options: languageOptions,
    disabled: true,
  },
};
