import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Logs } from './Logs';

describe('<Logs />', () => {
  test('it should mount', () => {
    render(<Logs message="Error test" />);

    const logs = screen.getByTestId('Logs');

    expect(logs).toBeInTheDocument();
  });
});
