import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Menu from './Menu';
import { Router } from 'react-router-dom';

const menuProps = {
  menus: [
    {
      title: 'My Account',
      path: '/group',
      onClickHandler: jest.fn(),
    },
  ],
};

describe('<Menu />', () => {
  test('it should mount', () => {
    render(
      <Router>
        <Menu {...menuProps} />
      </Router>
    );

    const menuComponent = screen.getByTestId('Menu');

    expect(menuComponent).toBeInTheDocument();
  });
});
