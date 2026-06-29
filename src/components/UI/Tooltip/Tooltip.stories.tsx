import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { hideControls } from '../storybookHelpers';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    interactive: { control: 'boolean' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
    },
    ...hideControls('children', 'tooltipClass', 'tooltipArrowClass'),
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    title: 'This is a tooltip',
    placement: 'top',
    children: <span style={{ display: 'inline-block', padding: '8px 16px', background: '#eee' }}>Hover me</span>,
  },
};

export const Bottom: Story = {
  args: {
    title: 'Tooltip on the bottom',
    placement: 'bottom',
    children: <span style={{ display: 'inline-block', padding: '8px 16px', background: '#eee' }}>Hover me</span>,
  },
};

export const Right: Story = {
  args: {
    title: 'Tooltip on the right',
    placement: 'right',
    children: <span style={{ display: 'inline-block', padding: '8px 16px', background: '#eee' }}>Hover me</span>,
  },
};

export const WithRichContent: Story = {
  render: (args) => (
    <Tooltip
      {...args}
      placement="top"
      interactive
      title={
        <>
          <strong>Session window</strong> is the 24-hour period after the last customer message.
        </>
      }
    >
      <span style={{ display: 'inline-block', padding: '8px 16px', background: '#eee' }}>
        Hover for rich tooltip
      </span>
    </Tooltip>
  ),
};
