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
} from 'mocks/Flow';
import { Flow } from './Flow';
import { setOrganizationServices } from 'services/AuthService';
import { getFilterTagQuery } from 'mocks/Tag';
import { getRoleNameQuery } from 'mocks/Role';
import userEvent from '@testing-library/user-event';
import { setErrorMessage, setNotification } from 'common/notification';

setOrganizationServices('{"__typename":"OrganizationServicesResult","rolesAndPermission":true}');

const mocks = [
  ...getOrganizationQuery,
  getFlowQuery,
  filterFlowQuery,
  getFilterTagQuery,
  getRoleNameQuery,
  getOrganizationLanguagesQuery,
  copyFlowQuery,
  createFlowQuery,
  createTagQuery,
];

const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};
vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
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
