import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioInput } from './RadioInput';

const meta: Meta<typeof RadioInput> = {
  title: 'UI/Form/RadioInput',
  component: RadioInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioInput>;

const Controlled = (args: any) => {
  const [value, setValue] = useState<boolean | null>(null);
  return (
    <RadioInput
      {...args}
      field={{ name: 'radio' }}
      form={{
        dirty: false,
        touched: {},
        errors: {},
        values: { radio: value },
        setFieldValue: (_name: string, val: boolean) => setValue(val),
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { radioTitle: 'Is active?' },
};

export const CustomLabels: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    radioTitle: 'Send on weekends?',
    labelYes: 'Include weekends',
    labelNo: 'Weekdays only',
  },
};

export const Column: Story = {
  render: (args) => <Controlled {...args} />,
  args: { radioTitle: 'Stacked layout', row: false },
};
