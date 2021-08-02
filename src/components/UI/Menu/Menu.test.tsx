import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Menu from './Menu';

const menuList = [
  {
    title: 'My Account',
    path: '/collection',
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
  test('it should render', () => {
    const { queryByText } = render(component);

    const menuComponent = screen.getByTestId('Menu');
    expect(menuComponent).toBeInTheDocument();

    const menuOption = queryByText('My Account');
    fireEvent.click(menuOption);
  });
});
