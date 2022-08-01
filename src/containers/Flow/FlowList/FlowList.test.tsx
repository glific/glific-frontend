import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { MockedProvider } from '@apollo/client/testing';

import {
  getFlowCountQuery,
  filterFlowQuery,
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery,
  importFlow,
  exportFlow,
  releaseFlow,
} from 'mocks/Flow';
import testJSON from 'mocks/ImportFlow.json';
import { setUserSession } from 'services/AuthService';
import { FlowList } from './FlowList';
import { Flow } from '../Flow';

const mocks = [
  getFlowCountQuery,
  filterFlowQuery,
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery,
  importFlow,
  releaseFlow,
  exportFlow,
];

const flowList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <FlowList />
    </MemoryRouter>
  </MockedProvider>
);

HTMLAnchorElement.prototype.click = jest.fn();

// console warning fix - react-i18next:: You will need to pass in an i18next instance by using initReactI18next
// https://github.com/i18next/react-i18next/issues/876
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
}));

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({ state: 'copy', pathname: '/flow/1/edit' }),
    useParams: () => ({ id: 1 }),
  };
});

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
      const searchInput = queryByPlaceholderText('Search') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Help Workflow' } });
      fireEvent.keyPress(searchInput, { key: 'enter', keyCode: 13 });
      expect(getByText('help, मदद')).toBeInTheDocument();
    });
  });

  test('click on Make a copy', async () => {
    const { container } = render(flowList);
    await waitFor(() => {
      expect(container.querySelector('#additionalButton-icon')).toBeInTheDocument();
      fireEvent.click(container.querySelector('#additionalButton-icon') as SVGAElement);
    });
  });

  test('should redirect to make a copy', async () => {
    // const history: any = createBrowserHistory();
    // history.push({ pathname: `/flow/1/edit`, state: 'copy' });

    const copyFlow = () => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Flow />
        </MemoryRouter>
      </MockedProvider>
    );
    const { container } = render(copyFlow());
    await waitFor(() => {
      const inputElement = container.querySelector('input[name="name"]') as HTMLInputElement;
      expect(inputElement?.value).toBe('Copy of Help');
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
    await waitFor(() => {});
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
