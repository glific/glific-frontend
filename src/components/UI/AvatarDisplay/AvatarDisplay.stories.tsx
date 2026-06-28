import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarDisplay } from './AvatarDisplay';

const meta: Meta<typeof AvatarDisplay> = {
  title: 'UI/AvatarDisplay',
  component: AvatarDisplay,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AvatarDisplay>;

export const Default: Story = {
  args: { name: 'John Doe' },
};

export const Large: Story = {
  args: { name: 'Jane Smith', type: 'large' },
};

export const WithBadge: Story = {
  args: { name: 'Active User', badgeDisplay: true },
};

export const LargeWithBadge: Story = {
  args: { name: 'Active User', type: 'large', badgeDisplay: true },
};
