import React from 'react';
import { shallow } from 'enzyme';
import { AutoComplete } from './AutoComplete';

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
    options: { option },
    optionLabel: 'label',
    field: { name: 'example', value: [] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: null },
  };

  const wrapper = shallow(<AutoComplete {...props} />);

  it('renders <AutoComplete /> component', () => {
    expect(wrapper).toBeTruthy();
  });
});
