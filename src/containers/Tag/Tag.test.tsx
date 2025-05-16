import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { getTagQuery, filterTagQuery, getFilterTagQuery, createTag } from 'mocks/Tag';
import { Tag } from './Tag';
import { setOrganizationServices } from 'services/AuthService';
import { getRoleNameQuery } from 'mocks/Role';
import * as Notification from 'common/notification';

setOrganizationServices('{"__typename":"OrganizationServicesResult","rolesAndPermission":true}');

const mocks = [
  ...getOrganizationQuery,
  getTagQuery,
  getTagQuery,
  filterTagQuery,
  getOrganizationLanguagesQuery,
  getFilterTagQuery,
  getRoleNameQuery,
  createTag,
];

const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

const notificationSpy = vi.spyOn(Notification, 'setNotification');
vi.mock('react-router', async () => ({
  ...((await vi.importActual<any>('react-router')) as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
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

it('should create the tag', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={['/tag/add']}>
        <Tag />
      </MemoryRouter>
    </MockedProvider>
  );
  await waitFor(() => {
    expect(screen.getByText('Add a new tag')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'tag' } });

  fireEvent.click(screen.getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
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
