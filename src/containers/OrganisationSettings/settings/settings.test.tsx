import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import settings from './settings';

describe('<settings />', () => {
  test('it should mount', () => {
    render(<settings />);
    
    const settings = screen.getByTestId('settings');

    expect(settings).toBeInTheDocument();
  });
});