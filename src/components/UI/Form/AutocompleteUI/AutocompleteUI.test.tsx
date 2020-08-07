import React from 'react';
import { shallow } from 'enzyme';
import AutocompleteUI from './AutocompleteUI';

describe('<AutocompleteUI />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<AutocompleteUI />);
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });
});
