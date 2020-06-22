import React from 'react';

import { shallow } from 'enzyme';
import ChatMessage from './ChatMessage';

describe('<ChatMessage />', () => {
  const defaultProps = {
    id: 1,
    body: 'Hello there!',
    contactId: 2,
    receiver: {
      id: 2,
    },
    insertedAt: '2020-06-19T18:44:02Z',
  };

  const wrapper = shallow(<ChatMessage {...defaultProps} />);
  test('it should render the message content correctly', () => {
    expect(wrapper.find('[data-testid="content"]').text()).toEqual('Hello there!');
  });

  test('it should render the message date  correctly', () => {
    expect(wrapper.find('[data-testid="date"]').text()).toEqual('00:14');
  });

  test('it should render "Other" class for the content', () => {
    expect(wrapper.find('.Other')).toHaveLength(1);
  });

  test('it should render the tags correctly', () => {
    //TODO: add the test once tag functionality is implemented
  });
});
