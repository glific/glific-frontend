import React from 'react';

import { shallow } from 'enzyme';
import Chat from './Chat';

describe('<Chat />', () => {
  const defaultProps = {
    conversationIndex: '1',
  };

  const wrapper = shallow(<Chat {...defaultProps} />);

  test('it should render <Chat /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
