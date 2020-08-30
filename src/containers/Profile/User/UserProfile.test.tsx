import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserProfile from './UserProfile';

describe('<UserProfile />', () => {
  test('it should mount', () => {
    render(<UserProfile />);
    
    const userProfile = screen.getByTestId('UserProfile');

    expect(userProfile).toBeInTheDocument();
  });
});