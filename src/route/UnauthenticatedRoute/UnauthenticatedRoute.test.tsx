import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { UnauthenticatedRoute } from './UnauthenticatedRoute';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';

describe('<UnauthenticatedRoute />', () => {
  test('it should mount', () => {
    const wrapper = mount(
      <Router>
        <UnauthenticatedRoute />
      </Router>
    );
    expect(wrapper).toBeTruthy();
  });
});
