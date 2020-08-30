import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ContactProfile from './ContactProfile';

describe('<ContactProfile />', () => {
  test('it should mount', () => {
    render(<ContactProfile />);
    
    const contactProfile = screen.getByTestId('ContactProfile');

    expect(contactProfile).toBeInTheDocument();
  });
});