import type { Meta, StoryObj } from '@storybook/react-vite';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { fn } from 'storybook/test';
import { hideControls } from '../storybookHelpers';
import Menu from './Menu';

const meta: Meta<typeof Menu> = {
  title: 'UI/Menu',
  component: Menu,
  tags: ['autodocs'],
  args: { onOpen: fn(), onClose: fn() },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'bottom-start', 'bottom-end'],
    },
    eventType: { control: 'select', options: ['Click', 'MouseEnter'] },
    ...hideControls('menus', 'children', 'onOpen', 'onClose'),
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

const menus = [
  { title: 'Edit', path: '', icon: <EditIcon fontSize="small" />, onClick: () => alert('Edit clicked') },
  { title: 'Duplicate', path: '', icon: <ContentCopyIcon fontSize="small" />, onClick: () => alert('Duplicate clicked') },
  { title: 'Delete', path: '', icon: <DeleteIcon fontSize="small" />, onClick: () => alert('Delete clicked') },
];

export const ClickTrigger: Story = {
  args: {
    menus,
    placement: 'bottom-start',
    eventType: 'Click',
    children: (
      <button style={{ cursor: 'pointer', padding: '6px 12px' }}>
        ⋯ Options
      </button>
    ),
  },
};

export const HoverTrigger: Story = {
  args: {
    menus,
    placement: 'right',
    eventType: 'MouseEnter',
    children: (
      <span style={{ cursor: 'pointer', padding: '6px 12px', background: '#eee', display: 'inline-block' }}>
        Hover me
      </span>
    ),
  },
};
