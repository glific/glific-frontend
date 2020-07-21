import React from 'react';
import { mount } from 'enzyme';
import { EmojiInput } from './EmojiInput';

const wrapper = mount(
  <EmojiInput
    form={{ touched: false, errors: {} }}
    field={{ name: 'input', value: '', onChange: jest.fn() }}
    placeholder="Title"
  />
);
it('renders <EmojiInput /> component', () => {
  expect(wrapper).toBeTruthy();
});

it('should have a emoji picker', () => {
  expect(wrapper.exists('[data-testid="emoji-picker"]')).toBe(true);
});

test('clicking on emoji picker should open a container to select emojis', () => {
  wrapper.find('[data-testid="emoji-picker"]').simulate('click');
  expect(wrapper.exists('[data-testid="emoji-container"]')).toBe(true);
});

test('clicking on an emoji should call onChange function', () => {
  wrapper.find('.emoji-mart-emoji').at(0).simulate('click');
});
