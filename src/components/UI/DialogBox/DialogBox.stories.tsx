import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { hideControls } from '../storybookHelpers';
import { DialogBox } from './DialogBox';

const meta: Meta<typeof DialogBox> = {
  title: 'UI/DialogBox',
  component: DialogBox,
  tags: ['autodocs'],
  parameters: {
    // DialogBox is a modal: MUI portals it to <body> with a position:fixed
    // backdrop. Rendered inline in the Docs page, each story's backdrop would
    // escape its block and cover the whole page (stacking to solid black).
    // Embedding each story in its own iframe traps the backdrop within it.
    docs: {
      story: { inline: false, height: '460px' },
    },
  },
  // Wire the callbacks to spies so clicks show up in the "Actions" tab.
  args: {
    handleOk: fn(),
    handleCancel: fn(),
    handleMiddle: fn(),
  },
  argTypes: {
    // Editable controls
    open: { control: 'boolean' },
    title: { control: 'text' },
    buttonOk: { control: 'text' },
    buttonCancel: { control: 'text' },
    buttonMiddle: { control: 'text' },
    alignButtons: { control: 'inline-radio', options: ['left', 'center'] },
    titleAlign: { control: 'inline-radio', options: ['left', 'center'] },
    contentAlign: { control: 'inline-radio', options: ['left', 'center'] },
    colorOk: { control: 'select', options: ['primary', 'secondary', 'error', 'warning'] },
    colorCancel: { control: 'select', options: ['primary', 'secondary', 'error', 'warning'] },
    skipCancel: { control: 'boolean' },
    skipOk: { control: 'boolean' },
    disableOk: { control: 'boolean' },
    buttonOkLoading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    alwaysOntop: { control: 'boolean' },
    // Not meaningfully editable through a form widget — hide the noisy "Set object" controls.
    ...hideControls('children', 'handleOk', 'handleCancel', 'handleMiddle', 'customStyles', 'additionalTitleStyles'),
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

// Auto-clicks the buttons and asserts the handlers fire — populates the "Interactions" tab.
export const ClickInteractions: Story = {
  args: {
    open: true,
    title: 'Confirm Actionvgjbjhbhbhb',
    children: <p>Are you sure you want to proceed?</p>,
  },
  play: async ({ args, canvasElement }) => {
    // MUI renders the Dialog in a portal, so query the whole document body.
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(await screen.findByTestId('ok-button'));
    await expect(args.handleOk).toHaveBeenCalledTimes(1);

    await userEvent.click(await screen.findByTestId('cancel-button'));
    await expect(args.handleCancel).toHaveBeenCalledTimes(1);
  },
};
