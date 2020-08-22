import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MenuItem from './MenuItem';

const menuItemProps = {
  title: 'My Account',
  path: '/myaccount',
  onClickHandler: jest.fn(),
};

describe('<MenuItem />', () => {
  test('it should mount', () => {
    render(<MenuItem {...menuItemProps} />);

    const menuItemComponent = screen.getByTestId('MenuItem');

    expect(menuItemComponent).toBeInTheDocument();
  });
});
