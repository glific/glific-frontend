import React from 'react';
import { shallow } from 'enzyme';
import { TagPage } from './TagPage';
import { TagList } from '../../../containers/Tag/TagList/TagList';

const wrapper = shallow(<TagPage />);

describe('<TagPage />', () => {
  it('should display the TagList Page', () => {
    expect(wrapper.find(TagList).exists()).toBe(true);
  });
});
