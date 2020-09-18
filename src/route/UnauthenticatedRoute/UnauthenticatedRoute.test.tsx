import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { UnauthenticatedRoute } from './UnauthenticatedRoute';
import { mount, shallow } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';

describe('<UnauthenticatedRoute />', () => {
  test('it should mount', () => {
    const wrapper = shallow(
      <Router>
        <UnauthenticatedRoute />
      </Router>
    );
    expect(wrapper).toBeTruthy();
  });
});
