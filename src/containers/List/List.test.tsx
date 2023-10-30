import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Routes, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';

import { Flow } from 'containers/Flow/Flow';
import { setUserSession } from 'services/AuthService';
import ActivateIcon from 'assets/images/icons/Activate.svg?react';
import ApprovedIcon from 'assets/images/icons/Template/Approved.svg?react';
import { LIST_MOCKS, defaultProps, ORG_LIST_MOCK, orgProps } from './List.test.helper';
import { List } from './List';

const mocks = LIST_MOCKS;

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <List {...defaultProps} />
    </Router>
  </MockedProvider>
);

afterEach(cleanup);
describe('<List />', () => {
  test('should have loading', async () => {
    const { getByTestId } = render(list);
    await waitFor(() => {
      expect(getByTestId('loading')).toBeInTheDocument();
    });
  });

  test('should have add new button', async () => {
    const { container } = render(list);
    await waitFor(() => {
      expect(container.querySelector('button.MuiButton-containedPrimary')).toBeInTheDocument();
    });
  });

  test('should have a table, search and reset', async () => {
    const { container, getByTestId } = render(list);

    await waitFor(() => {
      expect(container.querySelector('table')).toBeInTheDocument();
      fireEvent.change(getByTestId('searchInput').querySelector('input') as HTMLElement, {
        target: { value: 'help' },
      });
    });

    await waitFor(() => {
      fireEvent.submit(getByTestId('searchForm'));
      fireEvent.click(getByTestId('resetButton'));
    });
  });

  test('list has proper headers', async () => {
    const { container } = render(list);
    await waitFor(() => {
      const tableHead = container.querySelector('thead') as HTMLTableSectionElement;
      const { getByText } = within(tableHead);
      expect(getByText('Title')).toBeInTheDocument();
      expect(getByText('Last published')).toBeInTheDocument();
      expect(getByText('Last saved in Draft')).toBeInTheDocument();
      expect(getByText('Actions')).toBeInTheDocument();
    });
  });

  test('A row in the table should have an edit and delete button', async () => {
    render(list);
    // Wait for the MoreIcon to appear and become clickable
    await waitFor(() => {
      expect(screen.getByTestId('MoreIcon')).toBeInTheDocument();
    });
    const moreButton = screen.getByTestId('MoreIcon');
    fireEvent.click(moreButton);
    await waitFor(() => {
      expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });
  });
});

const listButtons = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Routes>
        <Route path="/" element={<List {...defaultProps} />} />
        <Route path="flow/add" element={<Flow />} />
      </Routes>
    </Router>
  </MockedProvider>
);

describe('<List /> actions', () => {
  test('add new Button contains a route to add new page', async () => {
    const { container } = render(listButtons);
    await waitFor(() => {
      const button = container.querySelector(
        'button.MuiButton-containedPrimary'
      ) as HTMLButtonElement;
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByTestId('add-container')).toBeInTheDocument();
    });
  });

  test('click on delete button opens dialog box', async () => {
    const { container } = render(list);
    // Wait for the MoreIcon to appear and become clickable
    const moreButton = await screen.findByTestId('MoreIcon', {}, { timeout: 5000 });
    fireEvent.click(moreButton);
    await waitFor(() => {
      const { queryByTestId } = within(container.querySelector('tbody tr') as HTMLTableRowElement);
      const button = queryByTestId('DeleteIcon') as HTMLButtonElement;
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });
  });

  test('click on agree button shows alert', async () => {
    const { getAllByTestId } = render(list);
    const moreButton = await screen.findByTestId('MoreIcon', {}, { timeout: 5000 });
    fireEvent.click(moreButton);

    await waitFor(() => {
      const button = getAllByTestId('DeleteIcon')[0];
      fireEvent.click(button);
    });

    await waitFor(() => {
      const agreeButton = screen
        .queryByRole('dialog')
        ?.querySelector('button.MuiButton-containedSecondary') as HTMLButtonElement;
      fireEvent.click(agreeButton);
    });
  });
});

test('list sorting', async () => {
  const { container } = render(list);
  await waitFor(() => {
    const tableHead = container.querySelector('thead') as HTMLTableSectionElement;
    const { getByText } = within(tableHead);
    fireEvent.click(getByText('Title'));
  });
});

describe('DialogMessage tests', () => {
  test.only('dialogMessage with custom component for delete', async () => {
    const useCustomDialog = () => {
      const component = (
        <div>
          <input type="text" placeholder="Testing custom dialog with input text" />
        </div>
      );
      return {
        component,
        props: {
          handleOk: vi.fn(),
          disableOk: false,
        },
      };
    };

    const additionalAction = () => [
      {
        icon: ApprovedIcon,
        parameter: 'id',
        label: 'Approve',
        button: (_item: any, _action: any, key: string) => (
          <button key={key} onClick={() => vi.fn()}>
            Approve
          </button>
        ),
      },
      {
        icon: ActivateIcon,
        parameter: 'id',
        label: 'Activate',
        button: (_item: any, _action: any, key: string) => (
          <button key={key} onClick={() => vi.fn()}>
            Activate
          </button>
        ),
      },
    ];

    let organizationProps = { ...orgProps, dialogMessage: useCustomDialog, additionalAction };

    window.history.replaceState({}, 'Organization', '/');
    const organizationList = (
      <MockedProvider mocks={ORG_LIST_MOCK} addTypename={false}>
        <Router>
          <Routes>
            <Route path="/" element={<List {...organizationProps} />} />
          </Routes>
        </Router>
      </MockedProvider>
    );

    const { container } = render(organizationList);

    await waitFor(() => {
      const { queryByTestId } = within(container.querySelector('tbody tr') as HTMLTableRowElement);
      const MoreButton = queryByTestId('MoreIcon');

      if (MoreButton) {
        fireEvent.click(MoreButton);
      }

      const button = queryByTestId('DeleteIcon') as HTMLButtonElement;
      fireEvent.click(button);
    });
  });
});

// // Need to check and write cases for card type

// // describe('Card list type', () => {
// //   const cardTypeProps = defaultProps;
// //   cardTypeProps.displayListType = 'card';
// //   cardTypeProps.cardLink = {
// //     start: 'collection',
// //     end: 'contacts',
// //   };
// //   cardTypeProps.listItem = 'collections';
// //   const card = (
// //     <MockedProvider mocks={mocks} addTypename={false}>
// //       <Router>
// //         <List {...cardTypeProps} />
// //       </Router>
// //     </MockedProvider>
// //   );

// //   test('list type is card', async () => {
// //     const { getAllByTestId } = render(card);

// //     await waitFor(() => {
// //       expect(getAllByTestId('description')[0]).toBeInTheDocument();
// //     });
// //   });
// // });
