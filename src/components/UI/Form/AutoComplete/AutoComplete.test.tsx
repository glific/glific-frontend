import { fireEvent, render, screen, within } from '@testing-library/react';
import { AutoComplete } from './AutoComplete';

describe('<AutoComplete />', () => {
  const option: any[] = [
    {
      description: null,
      id: '1',
      label: 'Messages',
    },
  ];

  const mockHandleChange = jest.fn();
  const getProps = (additionalProps: any) => ({
    ...additionalProps,
    label: 'Example',
    options: option,
    optionLabel: 'label',
    onChange: mockHandleChange,
    field: { name: 'example', value: [] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: mockHandleChange },
  });

  const getAsyncProps = (additionalProps: any) => ({
    ...additionalProps,
    label: 'Example',
    onChange: jest.fn(),
    options: option,
    optionLabel: 'label',
    field: { name: 'example', value: ['1'] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: jest.fn() },
    asyncSearch: true,
    asyncValues: {
      value: [{ id: '1', label: 'Messages' }],
      setValue: jest.fn(),
    },
  });

  it('renders <AutoComplete /> component', () => {
    render(<AutoComplete {...getProps({})} />);
    expect(screen.getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  it('should set the options list if getOptions prop is passed and have more more than 0 values', () => {
    const props = getProps({ getOptions: () => [{ id: 1, label: 'option' }] });
    render(<AutoComplete {...props} />);
    const autocomplete = screen.getByTestId('autocomplete-element');
    const input = within(autocomplete).getByRole('combobox');
    autocomplete.focus();
    fireEvent.change(input, { target: { value: 'o' } });
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(screen.getByText('option')).toBeInTheDocument();
  });

  it('should pick up additonalOptionLabel from props if optionLabel is not provided for the options', () => {
    const props = getProps({ additionalOptionLabel: 'name' });
    props.options = [
      {
        id: 1,
        label: 'Glific user 1',
      },
      {
        id: 1,
        name: 'Glific user 2',
        label: '',
      },
    ];

    render(<AutoComplete {...props} />);
    const autocomplete = screen.getByTestId('autocomplete-element');
    const input = within(autocomplete).getByRole('combobox');
    autocomplete.focus();
    fireEvent.change(input, { target: { value: 'G' } });
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    expect(screen.getByText('Glific user 1')).toBeInTheDocument();
  });

  it('renders with asynchronous values', () => {
    render(<AutoComplete {...getAsyncProps({})} />);
    const autocomplete = screen.getByTestId('autocomplete-element');
    expect(autocomplete).toBeInTheDocument();
    const message = screen.queryByText('Messages');
    expect(message).toBeInTheDocument();
  });

  it('should not render the selected values in input field if the renderTags prop is false', () => {
    render(<AutoComplete {...getAsyncProps({ renderTags: false, selectedOptionsIds: ['1'] })} />);
    const message = screen.queryByText('Messages');
    expect(message).not.toBeInTheDocument();
  });
});
