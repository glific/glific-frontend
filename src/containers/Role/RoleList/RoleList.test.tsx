import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { MockedProvider } from '@apollo/client/testing';

import testJSON from 'mocks/ImportFlow.json';
import { setUserSession } from 'services/AuthService';
import { RoleList } from './RoleList';
import { Role } from '../Role';
import { countRolesQuery, filterRolesQuery } from 'mocks/Role';

const mocks = [countRolesQuery, filterRolesQuery];

const rolesList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <RoleList />
    </MemoryRouter>
  </MockedProvider>
);

HTMLAnchorElement.prototype.click = jest.fn();

setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('<Role List />', () => {
  test('should render a list of roles', async () => {
    const { getByText } = render(rolesList);
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Role Management'));
    });
  });

  //   test('should search flow and check if flow keywprds are present below the name', async () => {
  //     const { getByText, getByTestId, queryByPlaceholderText } = render(rolesList);
  //     await waitFor(() => {
  //       // type "Help Workflow" in search box and enter
  //       expect(getByTestId('searchInput')).toBeInTheDocument();
  //       const searchInput = queryByPlaceholderText('Search');
  //       fireEvent.change(searchInput, { target: { value: 'Help Workflow' } });
  //       fireEvent.keyPress(searchInput, { key: 'enter', keyCode: 13 });
  //       expect(getByText('help, मदद')).toBeInTheDocument();
  //     });
  //   });

  //   test('click on Make a copy', async () => {
  //     const { container } = render(rolesList);
  //     await waitFor(() => {
  //       expect(container.querySelector('#additionalButton-icon')).toBeInTheDocument();
  //       fireEvent.click(container.querySelector('#additionalButton-icon'));
  //     });
  //   });

  //   test('should redirect to make a copy', async () => {
  //     const history: any = createBrowserHistory();
  //     history.push({ pathname: `/flow/1/edit`, state: 'copy' });

  //     const copyFlow = (match: any) => (
  //       <MockedProvider mocks={mocks} addTypename={false}>
  //         <Router history={history}>
  //           <Flow match={match} />
  //         </Router>
  //       </MockedProvider>
  //     );
  //     const { container } = render(copyFlow({ params: { id: 1 } }));
  //     await waitFor(() => {
  //       expect(container.querySelector('input[name="name"]')?.value).toBe('Copy of Help');
  //     });
  //   });

  //   test('should import flow using json file', async () => {
  //     render(rolesList);

  //     await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  //     await waitFor(() => {
  //       const importFlowButton = screen.getByText('Import.svg');
  //       expect(importFlowButton).toBeInTheDocument();
  //       fireEvent.click(importFlowButton);
  //     });

  //     await waitFor(() => {
  //       const json = JSON.stringify(testJSON);
  //       const file = new File([json], 'test.json', {
  //         type: 'application/json',
  //       });
  //       const input = screen.getByTestId('import');
  //       Object.defineProperty(input, 'files', {
  //         value: [file],
  //       });

  //       fireEvent.change(input);
  //     });

  //     await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));
  //     await waitFor(() => {});
  //   });

  //   test('should export flow to json file', async () => {
  //     global.URL.createObjectURL = jest.fn();
  //     render(rolesList);
  //     await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  //     await waitFor(() => {
  //       const exportButton = screen.getByText('Export.svg');
  //       expect(exportButton).toBeInTheDocument();

  //       fireEvent.click(exportButton);
  //     });
  //   });
});
