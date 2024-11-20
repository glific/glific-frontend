import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import {
  getFlowQuery,
  filterFlowQuery,
  updateFlowQuery,
  copyFlowQuery,
  createFlowQuery,
  createTagQuery,
  updateFlowQueryWithError,
  getFlowCountQuery,
  releaseFlow,
} from 'mocks/Flow';
import { Flow } from './Flow';
import { setOrganizationServices } from 'services/AuthService';
import { getFilterTagQuery } from 'mocks/Tag';
import { getRoleNameQuery } from 'mocks/Role';
import userEvent from '@testing-library/user-event';
import { setErrorMessage, setNotification } from 'common/notification';
import FlowList from './FlowList/FlowList';

setOrganizationServices('{"__typename":"OrganizationServicesResult","rolesAndPermission":true}');

const mocks = [
  ...getOrganizationQuery,
  getFlowQuery({ id: 1 }),
  getFlowQuery({ id: '1' }),
  filterFlowQuery({ isActive: true, isTemplate: false }),
  getFilterTagQuery,
  getRoleNameQuery,
  getOrganizationLanguagesQuery,
  copyFlowQuery({
    isActive: true,
    isPinned: false,
    isBackground: false,
    name: 'Copy of Help',
    keywords: [],
    description: '',
    ignoreKeywords: false,
    addRoleIds: [],
    deleteRoleIds: [],
  }),
  copyFlowQuery({
    isActive: true,
    isPinned: false,
    isBackground: false,
    name: 'Copy of Help',
    keywords: ['help', 'activity'],
    description: 'Help flow',
    ignoreKeywords: false,
    addRoleIds: [],
    deleteRoleIds: [],
    tag_id: '1',
  }),
  createFlowQuery({
    isActive: true,
    isPinned: false,
    isBackground: false,
    name: 'New Flow',
    keywords: ['मदद'],
    description: '',
    ignoreKeywords: false,
    addRoleIds: [],
    deleteRoleIds: [],
  }),
  createTagQuery,
  getFlowCountQuery({ isActive: true, isTemplate: false }),
  releaseFlow,
  getFilterTagQuery,
  updateFlowQuery,
  createFlowQuery({
    isActive: true,
    isPinned: false,
    isBackground: false,
    name: 'New Flow',
    keywords: [],
    description: '',
    ignoreKeywords: false,
    addRoleIds: [],
    deleteRoleIds: [],
  }),
  copyFlowQuery({
    isActive: true,
    isPinned: false,
    isBackground: false,
    name: 'Help flow',
    keywords: ['help'],
    description: '',
    ignoreKeywords: false,
    addRoleIds: [],
    deleteRoleIds: [],
  }),
];

const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};
const mockedUsedNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
  useNavigate: () => mockedUsedNavigate,
}));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setErrorMessage: vi.fn((...args) => {
      return args[1];
    }),
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

beforeEach(() => {
  cleanup();
});

const flow = () => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Flow />
    </MemoryRouter>
  </MockedProvider>
);

it('should render Flow', async () => {
  const wrapper = render(flow());
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

it('should create tag', async () => {
  const { getByText, getByRole } = render(flow());

  await waitFor(() => {
    expect(getByText('Add a new flow')).toBeInTheDocument();
  });

  const autoComplete = getByRole('combobox');
  autoComplete.focus();

  fireEvent.change(autoComplete, { target: { value: 'test' } });

  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'Enter' });

  // nothing to expect here, just to check if tag was created
});

it('should support keywords in a separate language', async () => {
  const user = userEvent.setup();
  const { getByText, getByTestId, container } = render(flow());

  await waitFor(() => {
    const nameInput = getByTestId('formLayout').querySelector('input[name="name"]');
    const keywordInput = getByTestId('formLayout').querySelector('input[name="keywords"]');

    expect(nameInput).toBeInTheDocument();
    expect(keywordInput).toBeInTheDocument();
  });

  await user.type(
    container.querySelector('input[name="name"]') as HTMLInputElement,
    '{backspace}{backspace}{backspace}{backspace}New Flow'
  );
  fireEvent.change(container.querySelector('input[name="keywords"]')!, {
    target: { value: 'मदद' },
  });

  const button = getByText('Save');
  fireEvent.click(button);

  await waitFor(() => {});
});

it('should not allow special characters in keywords', async () => {
  const { getByText, getByTestId } = render(flow());

  await waitFor(() => {
    const nameInput = getByTestId('formLayout').querySelector('input[name="name"]');
    const keywordInput = getByTestId('formLayout').querySelector('input[name="keywords"]');

    expect(nameInput).not.toBeNull();
    expect(nameInput).toBeInTheDocument();
    expect(keywordInput).not.toBeNull();
    expect(keywordInput).toBeInTheDocument();

    fireEvent.change(nameInput!, {
      target: { value: 'New Flow' },
    });
    fireEvent.change(keywordInput!, {
      target: { value: 'Hey&' },
    });

    const button = getByText('Save');
    fireEvent.click(button);

    expect(getByText('Sorry, special characters are not allowed.'));
  });
});

it('should edit the flow', async () => {
  const editFlow = () => (
    <MockedProvider mocks={[...mocks, updateFlowQuery]} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow" element={<FlowList />} />
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
  const { container, getByText } = render(editFlow());

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Edit flow')).toBeInTheDocument();
  });

  await waitFor(() => {
    const inputElement = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(inputElement?.value).toBe('Help');
  });

  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

it('should configure the flow', async () => {
  const editFlow = () => (
    <MockedProvider mocks={[...mocks, updateFlowQuery]} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow" element={<FlowList />} />
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
  const { getByText } = render(editFlow());

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Edit flow')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Configure'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

it('should edit the flow and show error if exists', async () => {
  const editFlow = () => (
    <MockedProvider mocks={[...mocks, updateFlowQueryWithError]} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
  const { container, getByText } = render(editFlow());

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Edit flow')).toBeInTheDocument();
  });

  await waitFor(() => {
    const inputElement = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(inputElement?.value).toBe('Help');
  });

  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(setErrorMessage).toHaveBeenCalled();
  });
});

it('should create copy of flow', async () => {
  mockUseLocationValue.state = 'copy';

  const copyFlow = () => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  const { container, getByTestId } = render(copyFlow());
  await waitFor(() => {
    const inputElement = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(inputElement?.value).toBe('Copy of Help');
  });

  fireEvent.change(container.querySelector('input[name="keywords"]') as HTMLInputElement, {
    target: { value: 'help, activity' },
  });
  const button = getByTestId('submitActionButton');
  fireEvent.click(button);
  await waitFor(() => {});
});

it('buttons should be disabled in template state', async () => {
  mockUseLocationValue.state = 'template';

  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Template Flow')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByTestId('submitActionButton')).toBeDisabled();
    expect(screen.getByTestId('remove-icon')).toBeDisabled();
  });

  fireEvent.click(screen.getByText('View'));

  await waitFor(() => {
    expect(mockedUsedNavigate).toHaveBeenCalled();
  });
});

it('should create copy of a template flow', async () => {
  mockUseLocationValue.state = 'copyTemplate';

  const copyFlow = () => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  const { container, getByTestId } = render(copyFlow());
  await waitFor(() => {
    expect(screen.getByText('Copy of Help')).toBeInTheDocument();
  });

  const button = getByTestId('submitActionButton');
  fireEvent.click(button);

  const inputs = screen.getAllByRole('textbox');
  fireEvent.change(inputs[0], { target: { value: 'Help flow' } });
  fireEvent.change(inputs[1], { target: { value: 'help' } });

  await waitFor(() => {});
});

it('should show validate the form and show errors', async () => {
  mockUseLocationValue.state = null;
  render(flow());

  await waitFor(() => {
    expect(screen.getByText('Add a new flow')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
  });

  fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'New Flow' } });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByTestId('loadingBtn')).toBeInTheDocument();
  });
});
