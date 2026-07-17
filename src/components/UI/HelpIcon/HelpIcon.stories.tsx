import type { Meta, StoryObj } from '@storybook/react-vite';
import { hideControls } from '../storybookHelpers';
import { HelpIcon } from './HelpIcon';

const meta: Meta<typeof HelpIcon> = {
  title: 'UI/HelpIcon',
  component: HelpIcon,
  tags: ['autodocs'],
  argTypes: {
    darkIcon: { control: 'boolean' },
    ...hideControls('helpData'),
  },
};

export default meta;
type Story = StoryObj<typeof HelpIcon>;

export const Default: Story = {
  args: {
    helpData: {
      heading: 'This field allows you to send templated messages to contacts.',
      link: 'https://glific.org',
    },
  },
};

export const LightIcon: Story = {
  args: {
    helpData: {
      heading: 'Light variant of the help icon.',
      link: 'https://glific.org',
    },
    darkIcon: false,
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#119656', padding: 16, display: 'inline-block' }}>
        <Story />
      </div>
    ),
  ],
};

export const NoLink: Story = {
  args: {
    helpData: {
      heading: 'Helpful description without a link.',
      link: '',
    },
  },
};
