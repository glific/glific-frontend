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
  filterTemplateFlows,
} from 'mocks/Flow';
import { getOrganizationQuery } from 'mocks/Organization';
import testJSON from 'mocks/ImportFlow.json';
import { setUserSession } from 'services/AuthService';
import { FlowList } from './FlowList';
import { Flow } from '../Flow';
import { getFilterTagQuery } from 'mocks/Tag';
import { getRoleNameQuery } from 'mocks/Role';

const isActiveFilter = { isActive: true, isTemplate: false };

const mocks = [
  getFlowCountQuery(isActiveFilter),
  getFlowCountQuery(isActiveFilter),
  getFlowCountQuery(isActiveFilter),
  getFlowCountQuery(isActiveFilter),
  filterFlowQuery(isActiveFilter),
  filterFlowQuery(isActiveFilter),
  filterFlowQuery(isActiveFilter),
  filterFlowQuery(isActiveFilter),
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery({ id: 1 }),
  getFlowQuery({ id: '1' }),
  importFlow,
  releaseFlow,
  exportFlow,
  getFilterTagQuery,
  getRoleNameQuery,
  getFlowCountQuery({ isTemplate: true }),
  filterTemplateFlows,
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

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useLocation: () => ({ state: 'copy', pathname: '/flow/1/edit' }),
    useParams: () => ({ id: 1 }),
    useNavigate: () => mockedUsedNavigate,
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
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Copy'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
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

    await waitFor(() => {
      expect(screen.getByText('Import flow Status')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));
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

describe('Template flows', () => {
  test('it opens and closes dialog box', async () => {
    render(flowList);

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    // test if it closes the dialog
    fireEvent.click(screen.getByTestId('CloseIcon'));

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Create flow')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });
  test('it shows and creates a template flows', async () => {
    render(flowList);

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Create flow')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('middle-button'));

    await waitFor(() => {
      expect(screen.getByText('Template Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('viewIt')[0]);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });
});
