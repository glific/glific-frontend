import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

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
import { getOrganizationQuery } from 'mocks/Organization';
import testJSON from 'mocks/ImportFlow.json';
import { setUserSession } from 'services/AuthService';
import { FlowList } from './FlowList';
import { Flow } from '../Flow';
import { getFilterTagQuery } from 'mocks/Tag';
import { getRoleNameQuery } from 'mocks/Role';

const mocks = [
  getFlowCountQuery,
  getFlowCountQuery,
  getFlowCountQuery,
  getFlowCountQuery,
  filterFlowQuery,
  filterFlowQuery,
  filterFlowQuery,
  filterFlowQuery,
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery({ id: 1 }),
  getFlowQuery({ id: '1' }),
  importFlow,
  releaseFlow,
  exportFlow,
  getFilterTagQuery,
  getRoleNameQuery,
  ...getOrganizationQuery,
];

const flowList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <FlowList />
    </MemoryRouter>
  </MockedProvider>
);

HTMLAnchorElement.prototype.click = vi.fn();

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useLocation: () => ({ state: 'copy', pathname: '/flow/1/edit' }),
    useParams: () => ({ id: 1 }),
  };
});

setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('<FlowList />', () => {
  test('should render Flow', async () => {
    const { getByText, getByTestId } = render(flowList);
    expect(getByTestId('loading')).toBeInTheDocument();
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

  test('should redirect to make a copy', async () => {
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

  test('click on Make a copy', async () => {
    const { getAllByTestId } = render(flowList);

    await waitFor(() => {
      expect(getAllByTestId('MoreIcon')[0]).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('MoreIcon')[0]);

    await waitFor(() => {
      expect(screen.getAllByTestId('additionalButton')[0]).toBeInTheDocument();
      fireEvent.click(screen.getAllByTestId('additionalButton')[0]);
    });
  });

  test('should import flow using json file', async () => {
    render(flowList);

    await waitFor(() => {
      expect(screen.getAllByTestId('import-icon')[0]).toBeInTheDocument();
    });

    const importFlowButton = screen.getAllByTestId('import-icon')[0];
    fireEvent.click(importFlowButton);

    await waitFor(() => {
      const json = JSON.stringify(testJSON);
      const file = new File([json], 'test.json', {
        type: 'application/json',
      });
      const input = screen.getByTestId('import');
      Object.defineProperty(input, 'files', {
        value: [file],
      });
    });

    const input = screen.getByTestId('import');
    fireEvent.change(input);

    await waitFor(() => {});
  });

  test('should export flow to json file', async () => {
    global.URL.createObjectURL = vi.fn();
    render(flowList);

    await waitFor(() => {
      screen.getAllByTestId('MoreIcon');
    });
    const moreButton = screen.getAllByTestId('MoreIcon');
    fireEvent.click(moreButton[0]);

    await waitFor(() => {
      const exportButton = screen.getAllByTestId('export-icon');
      expect(exportButton[0]).toBeInTheDocument();
      fireEvent.click(exportButton[0]);
    });
  });
});
