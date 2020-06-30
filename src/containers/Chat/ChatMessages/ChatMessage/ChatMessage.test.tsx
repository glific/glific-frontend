import React from 'react';
import { render, wait, within, fireEvent, screen, cleanup } from '@testing-library/react';
import moment from 'moment';
import { shallow } from 'enzyme';

import ChatMessage from './ChatMessage';
import { TIME_FORMAT } from '../../../../common/constants';

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('<ChatMessage />', () => {
  const insertedAt = '2020-06-19T18:44:02Z';
  const defaultProps = {
    id: 1,
    body: 'Hello there!',
    contactId: 2,
    receiver: {
      id: 2,
    },
    popup: 1,
    open: true,
    insertedAt,

    tags: [
      {
        id: 1,
        label: 'important',
      },
    ],
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
    const { container, getByTestId } = render(<ChatMessage {...defaultProps} />);
    const tags = within(getByTestId('tags'));
    expect(tags.getByText('important')).toBeInTheDocument();
  });

  test('it should render the down arrow icon', () => {
    const { container } = render(<ChatMessage {...defaultProps} />);
    expect(container.querySelector('.MuiIconButton-sizeSmall')).toBeInTheDocument();
  });

  test('it should render popup', async () => {
    const { container } = render(<ChatMessage {...defaultProps} />);

    expect(screen.getByText('Assign tag')).toBeInTheDocument();
  });
});
