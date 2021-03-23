import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { CollectionInformation } from './CollectionInformation';

describe('<CollectionInformation />', () => {
  test('it should mount', () => {
    render(<CollectionInformation collectionId={1} />);

    const collectionInformation = screen.getByTestId('CollectionInformation');

    expect(collectionInformation).toBeInTheDocument();
  });
});
