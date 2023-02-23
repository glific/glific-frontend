import { fireEvent, render, screen } from '@testing-library/react';

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
  const getProps: any = () => ({
    options: [{ id: '1', label: 'Default' }],
    label: 'Title',
    form: { errors: { dropdown: 'Required' } },
    placeholder: 'Input your title',
    field: { value: '1', onChange: changeValue },
<<<<<<< HEAD
    fieldChange: vi.fn(),
  };
=======
    fieldChange: jest.fn(),
  });
>>>>>>> 4dbe7c522ac873a242706890a14b252012abdb32

  it('renders <Dropdown /> component', () => {
    const wrapper = render(<Dropdown {...getProps()} />);
    expect(wrapper.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('should have correct placeholder', () => {
    const wrapper = render(<Dropdown {...getProps()} />);
    expect(wrapper.getByTestId('inputLabel')).toHaveTextContent('Input your title');
  });

  it('should have an initial value', () => {
    const wrapper = render(<Dropdown {...getProps()} />);
    expect(wrapper.getByTestId('mock-select')).toHaveTextContent('Default');
  });

  it('should call onChange function if the dropdown value is changed', () => {
    const wrapper = render(<Dropdown {...getProps()} />);
    fireEvent.change(wrapper.getByTestId('mock-select'), { target: { value: '1' } });
    expect(changeValue).toHaveBeenCalled();
  });

  it('should call onChange function if the dropdown value is changed', () => {
    const wrapper = render(<Dropdown {...getProps()} />);
    fireEvent.change(wrapper.getByTestId('mock-select'), { target: { value: '1' } });
    expect(changeValue).toHaveBeenCalled();
  });

  it('helper text should be present if the prop is passed', () => {
    const props = getProps();
    props.helperText = 'Please click here';
    render(<Dropdown {...props} />);
    expect(screen.getByText('Please click here')).toBeInTheDocument();
  });

  it('have options with name field rather than label', () => {
    const props = getProps();
    props.options = [{ id: '1', name: 'Default name' }];
    render(<Dropdown {...props} />);
    expect(screen.getByText('Default name')).toBeInTheDocument();
  });
});
