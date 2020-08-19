import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MenuItem from './MenuItem';

describe('<MenuItem />', () => {
  test('it should mount', () => {
    render(<MenuItem />);

    const menuItemComponent = screen.getByTestId('MenuItem');

    expect(menuItemComponent).toBeInTheDocument();
  });
});
