import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import { Dropdown } from './Dropdown';

vi.mock('@mui/material', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    Select: ({ onChange, children }: any) => (
      <div>
        <select
          data-testid="mock-select"
          onChange={() => {
            onChange();
          }}
        >
          <option key={children[0].props.value} value={children[0].props.value}>
            {children[0].props.children}
          </option>
        </select>
      </div>
    ),
  };
});

const changeValue = vi.fn();
describe('<Dropdown />', () => {
  const defaultProps = {
    options: [{ id: '1', label: 'Default' }],
    label: 'Title',
    form: { errors: { dropdown: 'Required' } },
    placeholder: 'Input your title',
    field: { value: '1', onChange: changeValue },
    fieldChange: vi.fn(),
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
    expect(wrapper.getByTestId('mock-select')).toHaveTextContent('Default');
  });

  it('should call onChange function if the dropdown value is changed', () => {
    const wrapper = render(<Dropdown {...defaultProps} />);
    fireEvent.change(wrapper.getByTestId('mock-select'), { target: { value: '1' } });
    expect(changeValue).toHaveBeenCalled();
  });
});
