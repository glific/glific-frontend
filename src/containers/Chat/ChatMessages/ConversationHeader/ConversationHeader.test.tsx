import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ConversationHeader from './ConversationHeader';
import {
  blockContactQuery,
  contactCollectionsQuery,
  updateContactCollectionQuery,
  clearMessagesQuery,
} from '../../../../mocks/Contact';
import { MemoryRouter } from 'react-router';
import {
  getCollectionInfo2,
  getCollectionUsersQuery2,
  getCollectionsQuery,
} from '../../../../mocks/Collection';
import {
  getPublishedFlowQuery,
  addFlowToContactQuery,
  addFlowToCollectionQuery,
} from '../../../../mocks/Flow';
import { CONVERSATION_MOCKS } from '../../../../mocks/Chat';
import { searchGroupQuery } from 'mocks/Groups';

const mocks = [
  ...CONVERSATION_MOCKS,
  contactCollectionsQuery,
  getCollectionInfo2,
  ...getCollectionsQuery,
  getPublishedFlowQuery,
  blockContactQuery,
  updateContactCollectionQuery,
  addFlowToContactQuery,
  addFlowToCollectionQuery,
  getCollectionUsersQuery2,
  clearMessagesQuery,
];

const defaultProps = {
  displayName: 'Jane Doe',
  entityId: '2',
  contact: {
    lastMessageTime: new Date(),
    contactBspStatus: 'SESSION',
  },
  handleAction: vi.fn(),
};
const propsWithBspStatusNone = {
  ...defaultProps,
  contact: {
    ...defaultProps.contact,
    contactBspStatus: 'NONE',
  },
};

const component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <ConversationHeader {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

test('it should render the name correctly', async () => {
  const { getByText, container } = render(component);

  const conversationHeaderComponent = screen.getByTestId('beneficiaryName');
  expect(conversationHeaderComponent).toBeInTheDocument();
  expect(getByText('Jane Doe')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Default Collection, Staff Collection')).toBeInTheDocument();
  });
});

test('it should have a session timer', async () => {
  const { getByText } = render(component);
  await waitFor(() => {
    expect(getByText('24 hrs')).toBeInTheDocument();
  });
});

describe('Menu test', () => {
  beforeEach(async () => {
    render(component);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('dropdownIcon')?.querySelector('svg') as SVGElement);
    });
  });

  test('it should open a menu when dropdown icon is clicked', async () => {
    expect(screen.getByText('View contact profile')).toBeInTheDocument();
  });

  test('clicking on add to collection button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('collectionButton'));
    await waitFor(() => {
      expect(screen.getByText('Add contact to collection')).toBeInTheDocument();
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
    expect(screen.getByTestId('icon-component')).toBeInTheDocument();
  });

  test('clicking on clear chat button should open up a dialog box', async () => {
    fireEvent.click(screen.getByTestId('clearChatButton'));

    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to clear all conversation for this contact?')
      ).toBeInTheDocument();
      // click on cancel
      fireEvent.click(screen.getByTestId('ok-button'));
    });
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
        <ConversationHeader {...propsWithBspStatusNone} />
      </MemoryRouter>
    </MockedProvider>
  );

  test('select flow should be blocked when Bsp Status is none', async () => {
    cleanup();
    const { getByTestId } = render(componentWithBspStatusNone);
    await waitFor(() => {
      fireEvent.click(getByTestId('dropdownIcon')?.querySelector('svg') as SVGElement);
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
    handleAction: vi.fn(),
  };

  const component = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ConversationHeader {...collectionDefaultProps} />
      </MemoryRouter>
    </MockedProvider>
  );
  test('It should render the collection name correctly', async () => {
    const { getByText } = render(component);
    await waitFor(() => {});
    const conversationHeaderComponent = screen.getByTestId('beneficiaryName');
    expect(conversationHeaderComponent).toBeInTheDocument();
    expect(getByText('Default Collection')).toBeInTheDocument();
  });

  test('It should render the collection name correctly', async () => {
    const { getByText } = render(component);
    await waitFor(() => {});
    const conversationHeaderComponent = screen.getByTestId('beneficiaryName');
    expect(conversationHeaderComponent).toBeInTheDocument();
    expect(getByText('Default Collection')).toBeInTheDocument();
  });

  test('clicking on Start flow should open up a dialog box', async () => {
    render(component);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('dropdownIcon')?.querySelector('svg') as SVGElement);
    });
    fireEvent.click(screen.getByTestId('flowButton'));

    expect(screen.getAllByText('Select flow')[0]).toBeInTheDocument();
    const button = screen.getByText('Start');
    fireEvent.click(button);
  });
});

const route = '/group/chat';
const propsForGroups = {
  groups: true,
  displayName: 'Oklahoma sheep',
  handleAction: vi.fn(),
  entityId: '1',
};
const mocksForGroups = [...searchGroupQuery];

const groupsComponent = (
  <MockedProvider mocks={mocksForGroups} addTypename={false}>
    <MemoryRouter initialEntries={[route]}>
      <ConversationHeader {...propsForGroups} groups={true} />
    </MemoryRouter>
  </MockedProvider>
);

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

test('it should render correct options for whatsapp group', async () => {
  render(groupsComponent);

  await waitFor(() => {
    fireEvent.click(screen.getByTestId('dropdownIcon')?.querySelector('svg') as SVGElement);
  });

  await waitFor(() => {
    expect(screen.getByText('View group details')).toBeInTheDocument();
    expect(screen.getByText('Add to collection')).toBeInTheDocument();
    expect(screen.getByText('Start a flow')).toBeInTheDocument();
  });
});

test('it navigates to group details', async () => {
  render(groupsComponent);

  await waitFor(() => {
    fireEvent.click(screen.getByTestId('dropdownIcon')?.querySelector('svg') as SVGElement);
  });

  await waitFor(() => {
    let item = screen.getByTestId('viewProfile');
    fireEvent.click(item);
    expect(mockedUsedNavigate).toHaveBeenCalled();
  });
});
