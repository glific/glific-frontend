import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Routes, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';

import { Tag } from 'containers/Tag/Tag';
import { setUserSession } from 'services/AuthService';
import { ReactComponent as ActivateIcon } from 'assets/images/icons/Activate.svg';
import { ReactComponent as ApprovedIcon } from 'assets/images/icons/Template/Approved.svg';
import { LIST_MOCKS, defaultProps, ORG_LIST_MOCK, orgProps } from './List.test.helper';
import { List } from './List';

const mocks = LIST_MOCKS;

const userObject = {
  __typename: 'User',
  id: '1',
  name: 'NGO Main Account',
  phone: '917834811114',
  roles: ['Admin'],
  contact: { __typename: 'Contact', id: '1' },
  groups: [
    { __typename: 'Group', id: '3', label: 'Default Group', description: null },
    { __typename: 'Group', id: '4', label: 'Restricted Group', description: null },
  ],
  organization: { __typename: 'Organization', id: '1' },
  language: { __typename: 'Language', id: '1', locale: 'en' },
};

setUserSession(JSON.stringify(userObject));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <List {...defaultProps} />
    </Router>
  </MockedProvider>
);

afterEach(cleanup);
describe('<List />', () => {
  test('should have loading', () => {
    const { getByText } = render(list);
    waitFor(() => {
      expect(getByText('Loading...')).toBeInTheDocument();
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
        target: { value: 'Unread' },
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
      expect(getByText('LABEL')).toBeInTheDocument();
      expect(getByText('DESCRIPTION')).toBeInTheDocument();
      expect(getByText('KEYWORDS')).toBeInTheDocument();
      expect(getByText('ACTIONS')).toBeInTheDocument();
    });
  });

  test('A row in the table should have an edit and delete button', async () => {
    const { container } = render(list);

    await waitFor(() => {
      const tableRow = container.querySelector('tbody tr') as HTMLTableRowElement;
      const { getByLabelText } = within(tableRow);
      expect(getByLabelText('Edit')).toBeInTheDocument();
      expect(getByLabelText('Delete')).toBeInTheDocument();
    });
  });
});

const listButtons = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Routes>
        <Route path="/tag/add" element={<Tag />} />
      </Routes>
      <List {...defaultProps} />
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
      expect(container.querySelector('div.ItemAdd')).toBeInTheDocument();
    });
  });

  test('click on delete button opens dialog box', async () => {
    const { container } = render(list);

    await waitFor(() => {
      const { queryByLabelText } = within(
        container.querySelector('tbody tr') as HTMLTableRowElement
      );
      const button = queryByLabelText('Delete') as HTMLButtonElement;
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });
  });

  test('click on agree button shows alert', async () => {
    const { getAllByTestId } = render(list);

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
    fireEvent.click(getByText('KEYWORDS'));
  });
});

describe('DialogMessage tests', () => {
  test('dialogMessage with custom component for delete', async () => {
    const useCustomDialog = () => {
      const component = (
        <div>
          <input type="text" placeholder="Testing custom dialog with input text" />
        </div>
      );
      return {
        component,
        handleOkCallback: jest.fn(),
        isConfirmed: true,
      };
    };

    const additionalAction = [
      {
        icon: ApprovedIcon,
        parameter: 'id',
        label: 'Approve',
        button: () => <button onClick={() => jest.fn()}>Approve</button>,
      },
      {
        icon: ActivateIcon,
        parameter: 'id',
        label: 'Activate',
        button: () => <button onClick={() => jest.fn()}>Activate</button>,
      },
    ];

    let props = { ...orgProps, dialogMessage: useCustomDialog, additionalAction };

    const list = (
      <MockedProvider mocks={ORG_LIST_MOCK} addTypename={false}>
        <Router>
          <List {...props} />
        </Router>
      </MockedProvider>
    );

    const { container } = render(list);

    await waitFor(() => {
      const { queryByLabelText } = within(
        container.querySelector('tbody tr') as HTMLTableRowElement
      );
      const button = queryByLabelText('Delete') as HTMLButtonElement;

      fireEvent.click(button);
    });
  });
});

// Need to check and write cases for card type

// describe('Card list type', () => {
//   const cardTypeProps = defaultProps;
//   cardTypeProps.displayListType = 'card';
//   cardTypeProps.cardLink = {
//     start: 'collection',
//     end: 'contacts',
//   };
//   cardTypeProps.listItem = 'collections';
//   const card = (
//     <MockedProvider mocks={mocks} addTypename={false}>
//       <Router>
//         <List {...cardTypeProps} />
//       </Router>
//     </MockedProvider>
//   );

//   test('list type is card', async () => {
//     const { getAllByTestId } = render(card);

//     await waitFor(() => {
//       expect(getAllByTestId('description')[0]).toBeInTheDocument();
//     });
//   });
// });
