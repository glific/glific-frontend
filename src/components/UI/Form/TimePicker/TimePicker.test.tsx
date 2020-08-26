import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TimePicker from './TimePicker';

describe('<TimePicker />', () => {
  test('it should mount', () => {
    render(<TimePicker />);
    
    const timePicker = screen.getByTestId('TimePicker');

    expect(timePicker).toBeInTheDocument();
  });
});