import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  ListReplyTemplate,
  ChatTemplate,
  SimulatorTemplate,
  ListReplyTemplateDrawer,
} from './ListReplyTemplate';

const items = [
  {
    title: 'first Section',
    subtitle: 'first Subtitle',
    options: [
      {
        type: 'text',
        title: 'section 1 row 1',
        description: 'first row of first section description',
      },
      {
        type: 'text',
        title: 'section 1 row 2',
        description: 'second row of first section description',
      },
      {
        type: 'text',
        title: 'section 1 row 3',
        description: 'third row of first section description',
      },
    ],
  },
  // if no option title don't render list item
  {
    title: 'Second Section',
    subtitle: '',
    options: [
      {
        type: 'text',
        title: '',
        description: '',
      },
    ],
  },
  // if no list header don't render
  {
    title: '',
    subtitle: '',
    options: [
      {
        type: 'text',
        title: '',
        description: '',
      },
    ],
  },
];

const globalButtons = [
  {
    type: 'text',
    title: 'button text',
  },
];

const props: any = {
  title: 'Test title',
  body: 'Test body',
  globalButtons,
  items,
  onGlobalButtonClick: jest.fn(),
  component: null,
};

test('it renders ListReplyTemplate on ChatScreen', async () => {
  props.component = ChatTemplate;
  render(<ListReplyTemplate {...props} />);

  const button = screen.getByRole('button', { name: 'button text' });
  fireEvent.click(button);

  await waitFor(() => {
    const item = screen.getByText('section 1 row 1');
    fireEvent.click(item);
  });

  await waitFor(() => {
    const done = screen.getByRole('button', { name: 'Done' });
    fireEvent.click(done);
  });
});

test('it renders ListReplyTemplate on SimulatorScreen', async () => {
  props.component = SimulatorTemplate;
  render(<ListReplyTemplate {...props} />);

  const button = screen.getByRole('button', { name: 'button text' });
  fireEvent.click(button);

  await waitFor(() => {});
});

const listProps: any = {
  items: { items, context: { id: '', gsId: 'scscs' } },
  drawerTitle: 'Title',
  onItemClick: jest.fn(),
  onDrawerClose: jest.fn(),
};

test('it renders ListReplyTemplate on SimulatorScreen and opens drawer', async () => {
  props.component = SimulatorTemplate;
  render(<ListReplyTemplateDrawer {...listProps} />);

  const button = screen.getByRole('button', {
    name: 'section 1 row 1 first row of first section description',
  });
  fireEvent.click(button);

  await waitFor(() => {});

  const sendButton = screen.getByRole('button', { name: 'Send' });
  fireEvent.click(sendButton);
});
