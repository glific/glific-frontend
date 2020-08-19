import React from 'react';
import { shallow } from 'enzyme';
import { Calendar } from './Calendar';

describe('<Calendar />', () => {
  const props = {
    name: 'dateFrom',
    type: 'date',
    placeholder: 'Date from',
    label: 'Date range',
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: function () {} },
  };

  const wrapper = shallow(<Calendar {...props} />);

  it('renders <Calendar /> component', () => {
    expect(wrapper).toBeTruthy();
  });
});
