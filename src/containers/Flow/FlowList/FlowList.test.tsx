import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FlowList } from './FlowList';
import { MockedProvider } from '@apollo/client/testing';
import {
  getFlowCountQuery,
  filterFlowQuery,
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery,
  importFlow,
  exportFlow,
} from '../../../mocks/Flow';
import testJSON from '../../../mocks/ImportFlow.json';
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
  importFlow,
  exportFlow,
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

  test('should import flow using json file', async () => {
    render(flowList);

    await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

    await waitFor(() => {
      const importFlowButton = screen.getByText('Import.svg');
      expect(importFlowButton).toBeInTheDocument();
      fireEvent.click(importFlowButton);
    });

    await waitFor(() => {
      const json = JSON.stringify(testJSON);
      const file = new File([json], 'test.json', {
        type: 'application/json',
      });
      const input = screen.getByTestId('import');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      fireEvent.change(input);
    });

    await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));
  });

  test('should export flow to json file', async () => {
    global.URL.createObjectURL = jest.fn();
    render(flowList);
    await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

    await waitFor(() => {
      const exportButton = screen.getByText('Export.svg');
      expect(exportButton).toBeInTheDocument();

      fireEvent.click(exportButton);
    });
  });
});
