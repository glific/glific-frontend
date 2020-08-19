import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Menu from './Menu';

describe('<Menu />', () => {
  test('it should mount', () => {
    render(<Menu />);

    const menuComponent = screen.getByTestId('Menu');

    expect(menuComponent).toBeInTheDocument();
  });
});
