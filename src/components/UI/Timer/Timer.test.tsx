import React from 'react';
import { mount } from 'enzyme';
import { Timer } from './Timer';

const timer = (time: Date) => <Timer time={time}></Timer>;

test('it should render timer component', () => {
  const wrapper = mount(timer(new Date()));
  expect(wrapper.exists()).toBe(true);
});

test('it should display the remaining time', () => {
  const date = new Date();
  date.setHours(date.getHours() - 2);
  const wrapper = mount(timer(date));
  expect(wrapper.find('[data-testid="timerCount"]').text()).toBe('22');
});
