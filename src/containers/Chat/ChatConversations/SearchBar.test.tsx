import React from 'react';
import { shallow } from 'enzyme';
import { SearchBar } from './SearchBar';
import { InputBase, IconButton } from '@material-ui/core';

describe('<SearchBar/>', () => {
  const mockChange = jest.fn();
  const mockSubmit = jest.fn();
  const mockReset = jest.fn();
  let searchVal = '';

  const component = () => {
    return (
      <SearchBar
        handleChange={mockChange}
        handleSubmit={mockSubmit}
        onReset={mockReset}
        searchVal={searchVal}
      />
    );
  };

  const wrapper = shallow(component());

  it('initialized properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('submit callback works properly', () => {
    wrapper.find('form').simulate('submit');
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('reset callback works properly', () => {
    let searchVal = 'hello there';
    const wrapper = shallow(
      <SearchBar
        handleChange={mockChange}
        handleSubmit={mockSubmit}
        onReset={mockReset}
        searchVal={searchVal}
      />
    );
    wrapper.find(IconButton).simulate('click');
    expect(mockReset).toHaveBeenCalled();
  });

  it('change in local search val renders change', () => {
    wrapper.find(InputBase).simulate('change', { target: { value: 'new val' } });
    expect(wrapper.find(InputBase).props().value).toEqual('new val');
    expect(mockChange).toHaveBeenCalled();
  });

  it('className gets passed in properly for additional styling', () => {
    const wrapper = shallow(
      <SearchBar
        handleChange={mockChange}
        handleSubmit={mockSubmit}
        onReset={mockReset}
        className={'mockClassName'}
      />
    );
    expect(wrapper.find('div').first().hasClass('SearchBar mockClassName')).toBe(true);
  });
});
