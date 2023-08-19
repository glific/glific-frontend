import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { getTagQuery, filterTagQuery, getFilterTagQuery } from 'mocks/Tag';
import { Tag } from './Tag';
import { setOrganizationServices } from 'services/AuthService';
import { getRoleNameQuery } from 'mocks/Role';

setOrganizationServices('{"__typename":"OrganizationServicesResult","rolesAndPermission":true}');

const mocks = [
  ...getOrganizationQuery,
  getTagQuery,
  filterTagQuery,
  getOrganizationLanguagesQuery,
  getFilterTagQuery,
  getRoleNameQuery,
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
  useParams: () => ({ id: 13 }),
}));

const tag = () => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Tag />
    </MemoryRouter>
  </MockedProvider>
);

it('should render Tag', async () => {
  const wrapper = render(tag());
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

it('should edit the tag', async () => {
  const edittag = () => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/tag/13/edit`]}>
        <Routes>
          <Route path="tag/:id/edit" element={<Tag />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
  const { container } = render(edittag());
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
  await waitFor(() => {
    const inputElement = container.querySelector('input[name="label"]') as HTMLInputElement;
    expect(inputElement?.value).toBe('Yes');
  });
});
