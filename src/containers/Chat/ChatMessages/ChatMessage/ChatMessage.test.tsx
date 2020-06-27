import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';

import ChatMessage from './ChatMessage';
import { TIME_FORMAT } from '../../../../common/constants';

describe('<ChatMessage />', () => {
  const insertedAt = '2020-06-19T18:44:02Z';
  const defaultProps = {
    id: 1,
    body: 'Hello there!',
    contactId: 2,
    receiver: {
      id: 2,
    },
    insertedAt,
    onClick: Function,
    tags: [],
    popup: false,
    setDialog: false,
  };

  const wrapper = shallow(<ChatMessage {...defaultProps} />);
  test('it should render the message content correctly', () => {
    expect(wrapper.find('[data-testid="content"]').text()).toEqual('Hello there!');
  });

  test('it should render the message date  correctly', () => {
    expect(wrapper.find('[data-testid="date"]').text()).toEqual(
      moment(insertedAt).format(TIME_FORMAT)
    );
  });

  test('it should render "Other" class for the content', () => {
    expect(wrapper.find('.Other')).toHaveLength(1);
  });

  test('it should render the tags correctly', () => {
    //TODO: add the test once tag functionality is implemented
  });
});
