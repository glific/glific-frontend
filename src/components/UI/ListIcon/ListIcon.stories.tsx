import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListIcon } from './ListIcon';

const meta: Meta<typeof ListIcon> = {
  title: 'UI/ListIcon',
  component: ListIcon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: [
        'chat', 'flow', 'search', 'analytics', 'speed-send', 'template', 'trigger',
        'notification', 'interactive-message', 'help', 'sheets', 'tickets', 'webhook',
        'fields', 'manage', 'collection', 'staff', 'contact', 'block', 'tag',
        'profile', 'account', 'settings', 'logout', 'organization', 'consulting',
        'waGroupCollection', 'waGroupChat', 'waGroup', 'assistant', 'aiEvals',
        'discord', 'waPolls', 'certificate', 'form',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ListIcon>;

export const Chat: Story = {
  args: { icon: 'chat' },
};

export const Flow: Story = {
  args: { icon: 'flow' },
};

export const Template: Story = {
  args: { icon: 'template' },
};

export const Selected: Story = {
  args: { icon: 'chat', selected: true },
};

export const WithBadgeCount: Story = {
  args: { icon: 'chat', count: 5 },
};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 16 }}>
      {[
        'chat', 'flow', 'search', 'analytics', 'speed-send', 'template',
        'trigger', 'notification', 'interactive-message', 'help', 'sheets',
        'tickets', 'webhook', 'fields', 'manage', 'collection', 'staff',
        'contact', 'block', 'tag', 'profile', 'account', 'settings',
        'logout', 'organization', 'consulting', 'waGroupCollection', 'waGroupChat',
        'waGroup', 'assistant', 'aiEvals', 'discord', 'certificate', 'form',
      ].map((icon) => (
        <div key={icon} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <ListIcon icon={icon} />
          <span style={{ fontSize: 10, color: '#666' }}>{icon}</span>
        </div>
      ))}
    </div>
  ),
};
