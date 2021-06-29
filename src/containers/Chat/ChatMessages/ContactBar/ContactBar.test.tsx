import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ContactBar from './ContactBar';
import {
  blockContactQuery,
  contactCollectionsQuery,
  updateContactCollectionQuery,
  clearMessagesQuery,
} from '../../../../mocks/Contact';
import { MemoryRouter } from 'react-router';
import { getCollectionsQuery } from '../../../../mocks/Collection';
import {
  getPublishedFlowQuery,
  addFlowToContactQuery,
  addFlowToCollectionQuery,
} from '../../../../mocks/Flow';
import { CONVERSATION_MOCKS } from '../../../../mocks/Chat';

const mocks = [
  ...CONVERSATION_MOCKS,
  contactCollectionsQuery,
  ...getCollectionsQuery,
  getPublishedFlowQuery,
  blockContactQuery,
  updateContactCollectionQuery,
  addFlowToContactQuery,
  addFlowToCollectionQuery,
  clearMessagesQuery,
];

const defaultProps = {
  displayName: 'Jane Doe',
  contactId: '2',
  lastMessageTime: new Date(),
  contactBspStatus: 'SESSION',
  handleAction: jest.fn(),
};
const propsWithBspStatusNone = { ...defaultProps, contactBspStatus: 'NONE' };

const component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <ContactBar {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render the name correctly', async () => {
  const { getByText, container } = render(component);

  const contactBarComponent = screen.getByTestId('beneficiaryName');
  expect(contactBarComponent).toBeInTheDocument();
  expect(getByText('Jane Doe')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Default Collection, Staff Collection')).toBeInTheDocument();
  });
});

test('it should have a session timer', async () => {
  const { getByText } = render(component);
  await waitFor(() => {
    expect(getByText('24')).toBeInTheDocument();
  });
});

describe('Menu test', () => {
  beforeEach(async () => {
    render(component);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('dropdownIcon')?.querySelector('svg'));
    });
  });

  test('it should open a menu when dropdown icon is clicked', async () => {
    expect(screen.getByText('View contact profile')).toBeInTheDocument();
  });

  test('clicking on add to collection button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('collectionButton'));
    await waitFor(() => {
      expect(screen.getByText('Add contact to collection')).toBeInTheDocument();
      expect(screen.getAllByText('Search')[1]).toBeInTheDocument();
      fireEvent.click(screen.getAllByText('Search')[1]);
      const button = screen.getByText('Save');
      fireEvent.click(button);
    });
  });

  test('close add to collection popup on click of cancel button', async () => {
    fireEvent.click(screen.getByTestId('collectionButton'));
    await waitFor(() => {
      expect(screen.getByText('Add contact to collection')).toBeInTheDocument();
      const button = screen.getByText('Cancel');
      fireEvent.click(button);
    });
  });

  test('clicking on Start flow should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('flowButton'));
    await waitFor(() => {
      expect(screen.getAllByText('Select flow')[0]).toBeInTheDocument();
    });
    await waitFor(() => {
      const button = screen.getByText('Start');
      fireEvent.click(button);
    });
  });

  test('close start a flow popup on click of cancel button', async () => {
    fireEvent.click(screen.getByTestId('flowButton'));
    await waitFor(() => {
      const button = screen.getByText('Cancel');
      fireEvent.click(button);
    });
  });

  test('check Chats option is present if screen size is less than 768', async () => {
    // // Change the viewport to 500px.
    global.innerWidth = 500;
    // // Trigger the window resize event.
    global.dispatchEvent(new Event('resize'));
    expect(screen.getByText('UnselectedDark.svg')).toBeInTheDocument();
  });

  test('clicking on clear chat button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('clearChatButton'));

    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to clear all conversation for this contact?')
      ).toBeInTheDocument();
    });
    // click on cancel
    fireEvent.click(screen.getByTestId('ok-button'));
  });

  test('close clear conversation popup on click of cancel', async () => {
    fireEvent.click(screen.getByTestId('clearChatButton'));

    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to clear all conversation for this contact?')
      ).toBeInTheDocument();
    });
    // click on cancel
    fireEvent.click(screen.getByTestId('cancel-button'));
  });

  test('clicking on block button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('blockButton'));

    await waitFor(() => {
      expect(screen.getByText('Do you want to block this contact')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));
  });

  test('block a contact', async () => {
    fireEvent.click(screen.getByTestId('blockButton'));

    await waitFor(() => {
      expect(screen.getByText('Do you want to block this contact')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Confirm'));
  });

  test('view contact profile', async () => {
    fireEvent.click(screen.getByTestId('viewProfile'));
  });

  const componentWithBspStatusNone = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ContactBar {...propsWithBspStatusNone} />
      </MemoryRouter>
    </MockedProvider>
  );

  test('Select flow should be blocked when Bsp Status is none', async () => {
    cleanup();
    const { getByTestId } = render(componentWithBspStatusNone);
    await waitFor(() => {
      fireEvent.click(getByTestId('dropdownIcon')?.querySelector('svg'));
    });
    await waitFor(() => {
      expect(getByTestId('disabledFlowButton')).toBeInTheDocument();
    });
  });
});

describe('Collection test', () => {
  const collectionDefaultProps = {
    displayName: 'Default Collection',
    collectionId: '2',
    handleAction: jest.fn(),
  };

  const component = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ContactBar {...collectionDefaultProps} />
      </MemoryRouter>
    </MockedProvider>
  );
  test('It should render the collection name correctly', async () => {
    const { getByText } = render(component);
    await waitFor(() => {});
    const contactBarComponent = screen.getByTestId('beneficiaryName');
    expect(contactBarComponent).toBeInTheDocument();
    expect(getByText('Default Collection')).toBeInTheDocument();
  });

  test('It should render the collection name correctly', async () => {
    const { getByText } = render(component);
    await waitFor(() => {});
    const contactBarComponent = screen.getByTestId('beneficiaryName');
    expect(contactBarComponent).toBeInTheDocument();
    expect(getByText('Default Collection')).toBeInTheDocument();
  });

  test('clicking on Start flow should open up a dialog box', async () => {
    render(component);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('dropdownIcon')?.querySelector('svg'));
    });
    fireEvent.click(screen.getByTestId('flowButton'));

    await waitFor(() => {
      expect(screen.getAllByText('Select flow')[0]).toBeInTheDocument();
      const button = screen.getByText('Start');
      fireEvent.click(button);
    });
  });
});
