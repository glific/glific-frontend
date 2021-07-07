import { render } from '@testing-library/react';
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
  const props = {
    label: 'Example',
    options: option,
    optionLabel: 'label',
    onChange: mockHandleChange,
    field: { name: 'example', value: [] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: mockHandleChange },
  };

  const asyncProps = {
    label: 'Example',
    onChange: jest.fn(),
    options: option,
    optionLabel: 'label',
    field: { name: 'example', value: ['1'] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: jest.fn() },
    asyncSearch: true,
    asyncValues: {
      value: ['1'],
      setValue: jest.fn(),
    },
  };

  const wrapper = render(<AutoComplete {...props} />);

  it('renders <AutoComplete /> component', () => {
    expect(wrapper.getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  // it('should open and close the list', () => {
  //   const wrapper = render(<AutoComplete {...props} />);

  //   act(() => {
  //     wrapper.find(Autocomplete).prop('onOpen')();
  //   });
  //   act(() => {
  //     wrapper.find(Autocomplete).prop('onClose')();
  //   });
  //   act(() => {
  //     wrapper
  //       .find(Autocomplete)
  //       .props()
  //       .onChange({ target: { value: ['1'] } });
  //   });

  //   expect(mockHandleChange).toBeCalled()
  // });

  // it('should search for an input', () => {
  //   const wrapper = render(<AutoComplete {...asyncProps} />);
  //   act(() => {
  //     wrapper
  //       .find(TextField)
  //       .props()
  //       .onChange({ target: { value: '1' } });
  //     wrapper
  //       .find(Autocomplete)
  //       .props()
  //       .onChange({ target: { value: '1' } }, ['1', '2']);
  //   });

  //   expect(mockHandleChange).toBeCalled()
  // });
});
