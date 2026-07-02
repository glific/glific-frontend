import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { hideControls } from '../../storybookHelpers';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Form/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'text' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    inputLabel: { control: 'text' },
    helperText: { control: 'text' },
    translation: { control: 'text' },
    autoComplete: { control: 'text' },
    rows: { control: 'number' },
    textArea: { control: 'boolean' },
    darkMode: { control: 'boolean' },
    disabled: { control: 'boolean' },
    togglePassword: { control: 'boolean' },
    ...hideControls(
      'field',
      'form',
      'editor',
      'emojiPicker',
      'endAdornment',
      'endAdornmentCallback',
      'validate',
      'onChange',
      'inputProp',
      'inputLabelSubtext',
      'customFieldError'
    ),
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

const Controlled = (args: any) => {
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Input
      {...args}
      field={{ name: 'field', value, onChange: (e: any) => setValue(e.target.value), onBlur: () => {} }}
      togglePassword={args.type === 'password' ? showPassword : undefined}
      endAdornmentCallback={args.type === 'password' ? () => setShowPassword((v) => !v) : undefined}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Enter text' },
};

export const WithLabel: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Email address', inputLabel: 'Email' },
};

export const Password: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Password', type: 'password' },
};

export const TextArea: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Enter a longer message…', textArea: true },
};

export const WithHelperText: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Phone number', helperText: 'Include country code, e.g. +91' },
};

export const WithError: Story = {
  render: (args) => (
    <Input
      {...args}
      field={{ name: 'email', value: '', onChange: () => {}, onBlur: () => {} }}
      form={{ touched: { email: true }, errors: { email: 'Email is required' } }}
    />
  ),
  args: { placeholder: 'Enter email' },
};

export const Disabled: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Disabled field', disabled: true },
};

export const DarkMode: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Dark mode input', darkMode: true },
  decorators: [
    (Story) => (
      <div style={{ background: '#073F24', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
