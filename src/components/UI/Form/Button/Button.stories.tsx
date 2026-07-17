import type { Meta, StoryObj } from '@storybook/react-vite';
import SaveIcon from '@mui/icons-material/Save';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Form/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['contained', 'outlined', 'text'] },
    color: { control: 'select', options: ['primary', 'secondary', 'error', 'warning'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Save',
    variant: 'contained',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'outlined',
    color: 'secondary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Saving...',
    variant: 'contained',
    color: 'primary',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'contained',
    disabled: true,
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <SaveIcon style={{ marginRight: 8 }} />
      Save
    </Button>
  ),
  args: {
    variant: 'contained',
    color: 'primary',
  },
};

export const TextVariant: Story = {
  args: {
    children: 'Learn more',
    variant: 'text',
    color: 'primary',
  },
};
