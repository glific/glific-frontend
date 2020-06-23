import React from 'react';
import { shallow } from 'enzyme';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('check if rendering the home page correctly', () => {
  const wrapper = shallow(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(wrapper.exists()).toBe(true);
});
