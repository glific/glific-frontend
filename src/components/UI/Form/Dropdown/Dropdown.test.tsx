import React from 'react';
import { render } from '@testing-library/react';
import { Dropdown } from './Dropdown';

describe('<Dropdown />', () => {
  const defaultProps = {
    options: [{ id: '1', label: 'Default' }],
    label: 'Title',
    form: { errors: { dropdown: 'Required' } },
    placeholder: 'Input your title',
    field: { value: '1' },
  };

  it('renders <Dropdown /> component', () => {
    const wrapper = render(<Dropdown {...defaultProps} />);
    expect(wrapper.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('should have correct placeholder', () => {
    const wrapper = render(<Dropdown {...defaultProps} />);
    expect(wrapper.getByTestId('inputLabel')).toHaveTextContent('Input your title');
  });

  it('should have an initial value', () => {
    const wrapper = render(<Dropdown {...defaultProps} />);
    expect(wrapper.container.querySelector('.MuiSelect-root')).toHaveTextContent('Default');
  });
});
