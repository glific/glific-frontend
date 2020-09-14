import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import AuthenticatedRoute from './AuthenticatedRoute';
import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';

describe('<AuthenticatedRoute />', () => {
  test('it should mount', () => {
    const wrapper = mount(
      <BrowserRouter>
        <AuthenticatedRoute />
      </BrowserRouter>
    );
    expect(wrapper).toBeTruthy();
  });
});
