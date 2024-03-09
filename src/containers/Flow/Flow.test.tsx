import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { getFlowQuery, filterFlowQuery, updateFlowQuery, copyFlowQuery } from 'mocks/Flow';
import { Flow } from './Flow';
import { setOrganizationServices } from 'services/AuthService';
import { getFilterTagQuery } from 'mocks/Tag';
import { getRoleNameQuery } from 'mocks/Role';
import userEvent from '@testing-library/user-event';

setOrganizationServices('{"__typename":"OrganizationServicesResult","rolesAndPermission":true}');

const mocks = [
  ...getOrganizationQuery,
  getFlowQuery,
  filterFlowQuery,
  getFilterTagQuery,
  getRoleNameQuery,
  getOrganizationLanguagesQuery,
  updateFlowQuery,
  copyFlowQuery,
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
  useParams: () => ({ id: 1 }),
}));

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
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
  const { container } = render(editFlow());
  await waitFor(() => {
    const inputElement = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(inputElement?.value).toBe('Help');
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
