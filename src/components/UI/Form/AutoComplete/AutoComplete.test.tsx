import React from 'react';
import {render} from "@testing-library/react";
import { AutoComplete } from './AutoComplete';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { act } from '@testing-library/react';

describe('<AutoComplete />', () => {
  const option: any[] = [
    {
      description: null,
      id: '1',
      label: 'Messages',
    },
  ];

  const mockHandleChange=jest.fn()
  const props = {
    label: 'Example',
    options: option,
    optionLabel: 'label',
    onChange:mockHandleChange,
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

<<<<<<< HEAD
  const wrapper = render(<AutoComplete {...props} />);
=======
  const wrapper = mount(<AutoComplete {...props} />);
>>>>>>> upstream/upgrade-packages

  it('renders <AutoComplete /> component', () => {
    expect(wrapper.getByTestId('autocomplete-element')).toBeInTheDocument();
  });

  it('should open and close the list', () => {
    const wrapper = mount(<AutoComplete {...props} />);

    act(() => {
      wrapper.find(Autocomplete).prop('onOpen')();
    });
    act(() => {
      wrapper.find(Autocomplete).prop('onClose')();
    });
    act(() => {
      wrapper
        .find(Autocomplete)
        .props()
        .onChange({ target: { value: ['1'] } });
    });

    expect(mockHandleChange).toBeCalled()
  });

  it('should search for an input', () => {
    const wrapper = mount(<AutoComplete {...asyncProps} />);
    act(() => {
      wrapper
        .find(TextField)
        .props()
        .onChange({ target: { value: '1' } });
      wrapper
        .find(Autocomplete)
        .props()
        .onChange({ target: { value: '1' } }, ['1', '2']);
    });

    expect(mockHandleChange).toBeCalled()
  });
});
