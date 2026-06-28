import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotLoader } from './DotLoader';

const meta: Meta<typeof DotLoader> = {
  title: 'UI/DotLoader',
  component: DotLoader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DotLoader>;

export const Default: Story = {};
