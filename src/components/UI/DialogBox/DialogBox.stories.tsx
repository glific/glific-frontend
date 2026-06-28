import type { Meta, StoryObj } from '@storybook/react-vite';
import { DialogBox } from './DialogBox';

const meta: Meta<typeof DialogBox> = {
  title: 'UI/DialogBox',
  component: DialogBox,
  tags: ['autodocs'],
  argTypes: {
    alignButtons: { control: 'select', options: ['left', 'center'] },
    titleAlign: { control: 'select', options: ['center', 'left'] },
    contentAlign: { control: 'select', options: ['left', 'center'] },
  },
};

export default meta;
type Story = StoryObj<typeof DialogBox>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Confirm Action',
    children: <p>Are you sure you want to proceed? This action cannot be undone.</p>,
  },
};

export const WithContent: Story = {
  args: {
    open: true,
    title: 'Delete Contact',
    children: (
      <p>
        Deleting this contact will remove all their conversation history. This action is permanent and cannot be
        reversed.
      </p>
    ),
    buttonOk: 'Delete',
    buttonCancel: 'Cancel',
    colorOk: 'error',
  },
};

export const SkipCancel: Story = {
  args: {
    open: true,
    title: 'Success',
    children: <p>Your changes have been saved successfully.</p>,
    skipCancel: true,
    buttonOk: 'Done',
  },
};

export const WithThreeButtons: Story = {
  args: {
    open: true,
    title: 'Save Changes',
    children: <p>Would you like to save your changes before leaving?</p>,
    buttonOk: 'Save',
    buttonMiddle: "Don't Save",
    buttonCancel: 'Cancel',
  },
};

export const LoadingOkButton: Story = {
  args: {
    open: true,
    title: 'Processing',
    children: <p>Please wait while we process your request.</p>,
    buttonOk: 'Submit',
    buttonOkLoading: true,
  },
};

export const CenterAligned: Story = {
  args: {
    open: true,
    title: 'Centered Dialog',
    children: <p>This dialog has center-aligned buttons.</p>,
    alignButtons: 'center',
    titleAlign: 'center',
    contentAlign: 'center',
  },
};
