import React from 'react';

import { shallow } from 'enzyme';
import ChatPage from './ChatPage';

describe('<ChatPage />', () => {
  const defaultProps = {
    contactId: '1',
  };

  const wrapper = shallow(<ChatPage {...defaultProps} />);

  test('it should render <ChatPage /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
