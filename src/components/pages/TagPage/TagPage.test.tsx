import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { TagPage } from './TagPage';
import { TagList } from '../../../containers/Tag/TagList/TagList';
import { MockedProvider } from '@apollo/client/testing';
import { getTagsCountQuery } from '../../../mocks/Tag';

const mocks = [getTagsCountQuery];

const wrapper = (
  <MockedProvider mocks={mocks}>
    <TagPage />
  </MockedProvider>
);

describe('<TagPage />', () => {
  it('should display the TagList Page', async () => {
    const { getByTestId } = render(wrapper);
    await waitFor(() => {
      expect(getByTestId('listHeader')).toBeInTheDocument();
    });
  });
});
