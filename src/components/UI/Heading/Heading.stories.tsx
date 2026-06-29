import type { Meta, StoryObj } from '@storybook/react-vite';
import { hideControls } from '../storybookHelpers';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'UI/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    formTitle: { control: 'text' },
    backLink: { control: 'text' },
    headerHelp: { control: 'text' },
    ...hideControls('helpData', 'button'),
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    formTitle: 'Contacts',
  },
};

export const WithBackLink: Story = {
  args: {
    formTitle: 'Edit Contact',
    backLink: '/contacts',
  },
};

export const WithHelpData: Story = {
  args: {
    formTitle: 'Templates',
    helpData: {
      heading: 'Templates are pre-approved messages you can send outside the 24-hour session window.',
      link: 'https://glific.org',
    },
  },
};

export const WithButton: Story = {
  args: {
    formTitle: 'Contacts',
    button: {
      show: true,
      label: 'Add Contact',
      action: () => console.log('Add Contact clicked'),
    },
  },
};

export const WithButtonLoading: Story = {
  args: {
    formTitle: 'Contacts',
    button: {
      show: true,
      label: 'Saving...',
      action: () => {},
      loading: true,
    },
  },
};

export const WithSubtitle: Story = {
  args: {
    formTitle: 'Flow Editor',
    headerHelp: 'Build conversational flows using the drag-and-drop editor.',
    backLink: '/flows',
  },
};
