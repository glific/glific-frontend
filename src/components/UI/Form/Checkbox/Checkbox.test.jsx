import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox as CheckboxElement } from '@material-ui/core';
import { Checkbox } from './Checkbox';

describe('<Checkbox />', () => {
  const props = {
    label: 'Example',
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: function () {} },
  };

  const wrapper = shallow(<Checkbox {...props} />);

  it('renders <Checkbox /> component', () => {
    expect(wrapper).toBeTruthy();
  });
});
