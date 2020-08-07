import React from 'react';
import { shallow } from 'enzyme';
import CollectionList from './CollectionList';

describe('<CollectionList />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<CollectionList />);
  });

  test('It should mount', () => {
    expect(component.length).toBe(1);
  });
});
