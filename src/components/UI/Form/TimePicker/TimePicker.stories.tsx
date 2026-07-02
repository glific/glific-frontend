import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { hideControls } from '../../storybookHelpers';
import { TimePicker } from './TimePicker';

const meta: Meta<typeof TimePicker> = {
  title: 'UI/Form/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    disabled: { control: 'boolean' },
    ...hideControls('field', 'form', 'variant', 'inputVariant'),
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

const Controlled = (args: any) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <TimePicker
      {...args}
      field={{ name: 'time', value, onBlur: () => {} }}
      form={{
        dirty: false,
        touched: {},
        errors: {},
        setFieldValue: (_: string, val: any) => setValue(val),
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Select time' },
};

export const WithHelperText: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Select time', helperText: 'Time is in IST (UTC+5:30)' },
};

export const Disabled: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Select time', disabled: true },
};
