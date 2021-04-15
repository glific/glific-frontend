import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { FlowList } from './FlowList';
import { MockedProvider } from '@apollo/client/testing';
import {
  getFlowCountQuery,
  filterFlowQuery,
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery,
} from '../../../mocks/Flow';
import { MemoryRouter, Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { setUserSession } from '../../../services/AuthService';
import { Flow } from '../Flow';

const mocks = [
  getFlowCountQuery,
  filterFlowQuery,
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery,
];

const flowList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <FlowList />
    </MemoryRouter>
  </MockedProvider>
);

// console warning fix - react-i18next:: You will need to pass in an i18next instance by using initReactI18next
// https://github.com/i18next/react-i18next/issues/876
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
}));

setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('<FlowList />', () => {
  test('should render Flow', async () => {
    const { getByText } = render(flowList);
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Flows'));
    });
  });

  test('should search flow and check if flow keywprds are present below the name', async () => {
    const { getByText, getByTestId, queryByPlaceholderText } = render(flowList);
    await waitFor(() => {
      // type "Help Workflow" in search box and enter
      expect(getByTestId('searchInput')).toBeInTheDocument();
      const searchInput = queryByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'Help Workflow' } });
      fireEvent.keyPress(searchInput, { key: 'enter', keyCode: 13 });
      expect(getByText('help, मदद')).toBeInTheDocument();
    });
  });

  test('click on Make a copy', async () => {
    const { container } = render(flowList);
    await waitFor(() => {
      expect(container.querySelector('#additionalButton-icon')).toBeInTheDocument();
      fireEvent.click(container.querySelector('#additionalButton-icon'));
    });
  });

  test('should redirect to make a copy', async () => {
    const history: any = createBrowserHistory();
    history.push({ pathname: `/flow/1/edit`, state: 'copy' });

    const copyFlow = (match: any) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router history={history}>
          <Flow match={match} />
        </Router>
      </MockedProvider>
    );
    const { container } = render(copyFlow({ params: { id: 1 } }));
    await waitFor(() => {
      expect(container.querySelector('input[name="name"]')?.value).toBe('Copy of Help');
    });
  });
});
