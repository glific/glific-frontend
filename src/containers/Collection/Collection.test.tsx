import React from 'react';
import { shallow } from 'enzyme';
import Collection from './Collection';

describe('<Collection />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<Collection />);
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });
});
