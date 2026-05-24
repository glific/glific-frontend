import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
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
  pinFlowQuery,
} from 'mocks/Flow';
import { getOrganizationQuery } from 'mocks/Organization';
import testJSON from 'mocks/ImportFlow.json';
import { setOrganizationServices, setUserSession } from 'services/AuthService';
import { FlowList } from './FlowList';
import { Flow } from '../Flow';
import { getFilterTagQuery } from 'mocks/Tag';
import { getRoleNameQuery } from 'mocks/Role';
import * as Notification from 'common/notification';
import { IMPORT_FLOW, PIN_FLOW } from 'graphql/mutations/Flow';
import { EXPORT_FLOW } from 'graphql/queries/Flow';

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
  filterFlowQuery({ ...isActiveFilter, tagIds: [1] }),
  getFlowCountQuery({ ...isActiveFilter, tagIds: [1] }),
  filterFlowNewQuery,
  getFlowCountNewQuery,
  getFlowQuery({ id: 1 }),
  getFlowQuery({ id: '1' }),
  releaseFlow,
  getFilterTagQuery,
  getRoleNameQuery,
  getFlowCountQuery({ isTemplate: true }),
  filterTemplateFlows,
  ...getOrganizationQuery,
];
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const flowList = (customMocks?: any[]) => (
  <MockedProvider mocks={customMocks || mocks}>
    <MemoryRouter>
      <FlowList />
    </MemoryRouter>
  </MockedProvider>
);

HTMLAnchorElement.prototype.click = vi.fn();

const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => {
  return {
    ...(await vi.importActual<any>('react-router')),
    useLocation: () => ({ state: 'copy', pathname: '/flow/1/edit' }),
    useParams: () => ({ id: 1 }),
    useNavigate: () => mockedUsedNavigate,
  };
});

setUserSession(JSON.stringify({ roles: [{ id: '1', label: 'Admin' }] }));
setOrganizationServices('{"__typename":"OrganizationServicesResult","rolesAndPermission":true}');
const notificationSpy = vi.spyOn(Notification, 'setNotification');

describe('<FlowList />', () => {
  test('should render Flow', async () => {
    const { getByText, getByTestId } = render(flowList());
    expect(getByTestId('loading')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Flows'));
    });

    await waitFor(() => {
      expect(getByText('help, मदद'));
      expect(getByText('help, activity, preference, op...'));
    });
  });

  test('should search flow and check if flow keywords are present below the name', async () => {
    const { getByText, getByTestId, queryByPlaceholderText } = render(flowList());
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
    const { getAllByTestId } = render(flowList());

    await waitFor(() => {
      expect(getAllByTestId('copy-icon')[0]).toBeInTheDocument();
    });

    fireEvent.click(getAllByTestId('copy-icon')[0]);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('should import flow using json file', async () => {
    render(flowList([...mocks, importFlow]));

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
    globalThis.URL.createObjectURL = vi.fn();
    render(flowList([...mocks, exportFlow]));

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

  test('should create from scratch ', async () => {
    render(flowList());

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Create flow')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('middle-button'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('it should pin/unpin the flows', async () => {
    render(flowList([...mocks, pinFlowQuery('2', true), pinFlowQuery('1')]));

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('pin-button')[0]);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });

    fireEvent.click(screen.getAllByTestId('unpin-button')[0]);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('it should navigate to create page with selected tag', async () => {
    render(flowList());

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    const autoComplete = screen.getAllByRole('combobox')[1];

    autoComplete.focus();

    fireEvent.change(autoComplete, { target: { value: 'Messages' } });

    fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autoComplete, { key: 'Enter' });

    fireEvent.click(screen.getByTestId('newItemButton'));
    fireEvent.click(screen.getByTestId('middle-button'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/flow/add', { state: { tag: { id: '1', label: 'Messages' } } });
    });
  });

  test('should navigate to edit page on clicking the edit button', async () => {
    render(flowList());

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreIcon')[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/flow/1/edit');
    });
  });

  test('should open responder link dialog on clicking the share button', async () => {
    render(flowList());

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('shareIcon')[0]);

    await waitFor(() => {
      expect(screen.getByText('Share Responder Link')).toBeInTheDocument();
    });
  });

  test('should show warning when no keywords are selected and share button is clicked', async () => {
    render(flowList());

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('shareIcon')[2]);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('No keywords found to share the responder link', 'warning');
    });
  });
});

describe('Template flows', () => {
  test('it opens and closes dialog box', async () => {
    render(flowList());

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
    render(flowList());

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Create flow')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.getByText('Template Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('viewIt')[0]);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('click on Use it for templates', async () => {
    render(flowList());

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('newItemButton'));

    await waitFor(() => {
      expect(screen.getByText('Create flow')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.getByText('Template Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('copyTemplate')[0]);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });

  test('Template flows > should display assistant nodes that need an assistant assigned', async () => {
    const mockImportFlowWithAssistantError = {
      request: { query: IMPORT_FLOW },
      result: {
        data: {
          importFlow: {
            status: [
              {
                assistantNodeUuids: ['3fb647a3-c935-4906-8dd0-c0e63105ee3d', 'b1d2e9ff-1234-4abc-9876-deadbeefcafe'],
                flowName: 'Test Flow',
                status: 'Successfully imported',
              },
            ],
          },
        },
      },
      variableMatcher: () => true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseWithoutImport = mocks.filter((m) => (m as any)?.request?.query !== IMPORT_FLOW);
    const testMocks = [mockImportFlowWithAssistantError, ...baseWithoutImport];

    class FileReaderMock {
      onload: null | ((e: unknown) => void) = null;
      result: string | null = null;

      readAsText() {
        const text = JSON.stringify(testJSON);
        this.result = text;
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: text } } as unknown as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }

    vi.stubGlobal('FileReader', FileReaderMock);

    render(
      <MockedProvider mocks={testMocks} addTypename={false}>
        <MemoryRouter>
          <FlowList />
        </MemoryRouter>
      </MockedProvider>
    );

    await screen.findAllByTestId('import-icon');
    fireEvent.click(screen.getAllByTestId('import-icon')[0]);

    const file = new File([JSON.stringify(testJSON)], 'test.json', { type: 'application/json' });
    const input = await screen.findByTestId('import');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    const title = await screen.findByText(/import flow status/i);
    const dialog = title.closest('div')!;
    const inDialog = within(dialog);

    const helpLink = await inDialog.findByText(/create a new assistant/i);
    const para = helpLink.closest('p');
    expect(para).toBeTruthy();
    expect(normalize(para!.textContent || '')).toContain(
      'flow imported successfully. this flow contains assistant node(s) that need an assistant assigned'
    );

    const nodeLabels = inDialog.getAllByText((_, el) => normalize(el?.textContent || '') === 'assistant node uuids:');
    expect(nodeLabels.length).toBeGreaterThan(0);

    expect(inDialog.getByText('3fb647a3-c935-4906-8dd0-c0e63105ee3d')).toBeInTheDocument();
    expect(inDialog.getByText('b1d2e9ff-1234-4abc-9876-deadbeefcafe')).toBeInTheDocument();

    expect(helpLink).toHaveAttribute(
      'href',
      'https://glific.github.io/docs/docs/Integrations/Filesearch%20Using%20OpenAI%20Assistants/#how-to-create-an-openai-assistant-in-glific'
    );
    expect(helpLink).toHaveAttribute('target', '_blank');
    expect(helpLink).toHaveAttribute('rel', 'noopener noreferrer');

    fireEvent.click(inDialog.getByTestId('ok-button'));
    await waitFor(() => {
      expect(screen.queryByText(/import flow status/i)).not.toBeInTheDocument();
    });
  });
});

describe('Error handling', () => {
  test('should show error notification when export flow fails', async () => {
    const exportFlowError = {
      request: {
        query: EXPORT_FLOW,
        variables: { id: '1' },
      },
      error: new Error('Network error'),
    };

    render(flowList([...mocks, exportFlowError]));

    await waitFor(() => {
      screen.getAllByTestId('MoreIcon');
    });

    fireEvent.click(screen.getAllByTestId('MoreIcon')[0]);

    await waitFor(() => {
      expect(screen.getAllByTestId('export-icon')[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('export-icon')[0]);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('should show error notification when import flow fails', async () => {
    const importFlowError = {
      request: {
        query: IMPORT_FLOW,
      },
      error: new Error('Import failed'),
      variableMatcher: () => true,
    };

    class FileReaderMock {
      onload: null | ((e: unknown) => void) = null;
      result: string | null = null;
      readAsText() {
        const text = '{"flows":[]}';
        this.result = text;
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: text } } as unknown as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', FileReaderMock);

    render(flowList([...mocks, importFlowError]));

    await screen.findAllByTestId('import-icon');
    fireEvent.click(screen.getAllByTestId('import-icon')[0]);

    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = await screen.findByTestId('import');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('An error occured while importing the flow', 'warning');
    });
  });

  test('should show error notification when pin flow fails', async () => {
    const pinFlowError = {
      request: {
        query: PIN_FLOW,
        variables: { updateFlowId: '2', input: { isPinned: true } },
      },
      error: new Error('Pin failed'),
    };

    render(flowList([...mocks, pinFlowError]));

    await waitFor(() => {
      expect(screen.getByText('Flows')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('pin-button')[0]);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Failed to update pin status', 'warning');
    });
  });
});
