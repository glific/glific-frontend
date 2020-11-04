import React from 'react';
import { mount } from 'enzyme';
import { AutoComplete } from './AutoComplete';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';

describe('<AutoComplete />', () => {
  const option: any[] = [
    {
      description: null,
      id: '1',
      label: 'Messages',
    },
  ];
  const props = {
    label: 'Example',
    options: option,
    optionLabel: 'label',
    field: { name: 'example', value: [] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: jest.fn() },
  };

  const props1 = {
    label: 'Example',
    onChange:jest.fn(),
    options: option,
    optionLabel: 'label',
    field: { name: 'example', value: [] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: jest.fn() },
    asyncSearch:true,
    asyncValues:{
      value:['1'],
      setValue:jest.fn()
    }
  };

  const wrapper = mount(<AutoComplete {...props} />);

  it('renders <AutoComplete /> component', () => {
    expect(wrapper).toBeTruthy();
  });

  it('renders <AutoComplete /> component', () => {
    const wrapper = mount(<AutoComplete {...props} />);
    wrapper.find(Autocomplete).prop('onOpen')()
    wrapper.find(Autocomplete).prop('onClose')()
    wrapper.find(Autocomplete).props().onChange({ target: { value: ['1']} })
  });


  it('renders <AutoComplete /> component', () => {
    const wrapper = mount(<AutoComplete {...props1} />);
    wrapper.find(TextField).props().onChange({ target: { value: 1 } })
    wrapper.find(Autocomplete).props().onChange({ target: { value: '1' } },['1','2'])

    

   
  });
});
