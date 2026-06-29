import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { hideControls } from '../../storybookHelpers';
import { DateTimePicker } from './DateTimePicker';

const meta: Meta<typeof DateTimePicker> = {
  title: 'UI/Form/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    label: { control: 'text' },
    format: { control: 'text' },
    ...hideControls('field', 'form', 'variant', 'inputVariant', 'minDate', 'onChange'),
  },
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

const Controlled = (args: any) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <DateTimePicker
      {...args}
      field={{ name: 'datetime', value, onBlur: () => {} }}
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
  args: { placeholder: 'Select date and time' },
};

export const WithLabel: Story = {
  render: (args) => <Controlled {...args} />,
  args: { placeholder: 'Schedule date', label: 'Send at' },
};
