import type { Meta, StoryObj } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { Timer } from './Timer';
import { hideControls } from '../storybookHelpers';

const meta: Meta<typeof Timer> = {
  title: 'UI/Timer',
  component: Timer,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    contactStatus: { control: 'text' },
    contactBspStatus: { control: 'text' },
    ...hideControls('time'),
  },
};

export default meta;
type Story = StoryObj<typeof Timer>;

export const ActiveSession: Story = {
  args: {
    time: dayjs().subtract(2, 'hour').toISOString(),
  },
};

export const ExpiringSession: Story = {
  args: {
    time: dayjs().subtract(20, 'hour').toISOString(),
  },
};

export const ExpiredSession: Story = {
  args: {
    time: dayjs().subtract(25, 'hour').toISOString(),
  },
};

export const OptedOut: Story = {
  args: {
    time: null,
    contactBspStatus: 'NONE',
  },
};

export const InvalidContact: Story = {
  args: {
    time: null,
    contactStatus: 'INVALID',
  },
};

export const SecondaryVariant: Story = {
  args: {
    time: dayjs().subtract(5, 'hour').toISOString(),
    variant: 'secondary',
  },
};
