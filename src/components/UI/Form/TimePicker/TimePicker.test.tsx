import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { TimePicker } from './TimePicker';
import { shallow } from 'enzyme';

describe('<TimePicker />', () => {
  const props = {
    placeholder: 'TimePicker',
    disabled: true,
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: null },
  };
  const TimePicker = () => <TimePicker {...props} />;
  let component;

  beforeEach(() => {
    component = shallow(TimePicker());
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });

  it('renders component properly', () => {
    const wrapper = shallow(TimePicker());
    expect(wrapper).toBeTruthy();
  });
});
