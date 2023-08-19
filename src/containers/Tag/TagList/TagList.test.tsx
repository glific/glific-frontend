import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import { setUserSession } from 'services/AuthService';
import { TagList } from './TagList';
import { countTagQuery, filterTagQuery, getTagQuery } from 'mocks/Tag';

const mocks = [getTagQuery, filterTagQuery, countTagQuery];

const tagList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <TagList />
    </MemoryRouter>
  </MockedProvider>
);

HTMLAnchorElement.prototype.click = vi.fn();

setUserSession(JSON.stringify({ roles: ['Admin'] }));

describe('<TagList />', () => {
  test('should render Flow', async () => {
    const { getByText } = render(tagList);
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Tags'));
    });
  });
});
