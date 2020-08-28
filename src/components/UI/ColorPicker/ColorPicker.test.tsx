import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ColorPicker from './ColorPicker';

describe('<ColorPicker />', () => {
  test('it should mount', () => {
    render(<ColorPicker />);
    
    const colorPicker = screen.getByTestId('ColorPicker');

    expect(colorPicker).toBeInTheDocument();
  });
});