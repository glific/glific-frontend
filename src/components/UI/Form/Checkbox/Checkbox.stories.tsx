import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { hideControls } from '../../storybookHelpers';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Form/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    disabled: { control: 'boolean' },
    darkCheckbox: { control: 'boolean' },
    addLabelStyle: { control: 'boolean' },
    infoType: { control: 'inline-radio', options: ['tooltip', 'dialog'] },
    ...hideControls('field', 'form', 'handleChange', 'handleInfoClick', 'info', 'className'),
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

const Controlled = (args: any) => {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      {...args}
      field={{ name: 'checkbox', value: checked }}
      form={{ setFieldValue: (_name: string, val: boolean) => setChecked(val), touched: {}, errors: {} }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  args: { title: 'Enable notifications' },
};

const CheckedByDefaultWrapper = (args: any) => {
  const [checked, setChecked] = useState(true);
  return (
    <Checkbox
      {...args}
      field={{ name: 'checkbox', value: checked }}
      form={{ setFieldValue: (_: string, val: boolean) => setChecked(val), touched: {}, errors: {} }}
    />
  );
};

export const CheckedByDefault: Story = {
  render: (args) => <CheckedByDefaultWrapper {...args} />,
  args: { title: 'Enabled by default' },
};

export const WithTooltipInfo: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    title: 'Send read receipts',
    info: { title: 'When enabled, contacts will see when you have read their messages.' },
    infoType: 'tooltip',
  },
};

export const Disabled: Story = {
  render: (args) => <Controlled {...args} />,
  args: { title: 'Disabled option', disabled: true },
};
