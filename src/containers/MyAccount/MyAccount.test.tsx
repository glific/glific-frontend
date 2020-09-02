import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyAccount from './MyAccount';

describe('<MyAccount />', () => {
  test('it should mount', () => {
    render(<MyAccount />);
    
    const myAccount = screen.getByTestId('MyAccount');

    expect(myAccount).toBeInTheDocument();
  });
});