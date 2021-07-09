import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import MenuItem from './MenuItem';

const menuItemProps = {
  title: 'My Account',
  path: '/myaccount',
  onClickHandler: jest.fn(),
};

const component = (
  <Router>
    <MenuItem {...menuItemProps} />
  </Router>
);

describe('<MenuItem />', () => {
  test('it should render', () => {
    render(component);

    const menuItemComponent = screen.getByTestId('MenuItem');

    expect(menuItemComponent).toBeInTheDocument();
  });
});
