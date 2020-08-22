import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from './Menu';
import { BrowserRouter as Router } from 'react-router-dom';

const menuList = [
  {
    title: 'My Account',
    path: '/group',
  },
];

const component = (
  <Router>
    <Menu menus={menuList}>
      <div>Menu Option</div>
    </Menu>
  </Router>
);

describe('<Menu />', () => {
  test('it should mount', () => {
    const { queryByText } = render(component);

    const menuComponent = screen.getByTestId('Menu');
    expect(menuComponent).toBeInTheDocument();

    const menuOption = queryByText('My Account');
    fireEvent.click(menuOption);
  });
});
