import React from 'react';
import { shallow } from 'enzyme';
import PhoneInput from './PhoneInput';

describe('<PhoneInput />', () => {
  const props = {
    error: false,
    helperText: 'Your helper text',
  };
  const phoneInput = () => (
    <PhoneInput error={props.error} helperText={props.helperText} onChange={onchange} />
  );
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
