import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import AuthenticatedRoute from './AuthenticatedRoute';
import { mount, shallow } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';

describe('<AuthenticatedRoute />', () => {
  test('it should mount', () => {
    const wrapper = shallow(
      <BrowserRouter>
        <AuthenticatedRoute />
      </BrowserRouter>
    );
    expect(wrapper).toBeTruthy();
  });
});
