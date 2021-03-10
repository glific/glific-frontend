import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SavedSearches from './SavedSearches';

describe('<SavedSearches />', () => {
  test('it should mount', () => {
    render(<SavedSearches />);

    const savedSearches = screen.getByTestId('SavedSearches');

    expect(savedSearches).toBeInTheDocument();
  });
});
