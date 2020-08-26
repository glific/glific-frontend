import React from 'react';
import { shallow } from 'enzyme';
import PhoneInput from './PhoneInput';

describe('<PhoneInput />', () => {
  const props = {
    helperText: 'Your helper text',
    field: { name: 'example', value: [] },
    placeholder: 'Your phone number',
    form: { dirty: false, touched: false, errors: false, setFieldValue: null },
  };
  const phoneInput = () => <PhoneInput {...props} />;
  let component;

  beforeEach(() => {
    component = shallow(phoneInput());
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });

  it('renders component properly', () => {
    const wrapper = shallow(phoneInput());
    expect(wrapper).toBeTruthy();
  });
});
