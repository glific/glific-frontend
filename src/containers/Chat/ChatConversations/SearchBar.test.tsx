import React from 'react';
import { shallow } from 'enzyme';
import { SearchBar } from './SearchBar';

describe('<SearchBar/>', () => {
  const mockSubmit = jest.fn();
  const mockReset = jest.fn();
  let searchVal: string;

  const component = () => {
    return <SearchBar handleSubmit={mockSubmit} onReset={mockReset} searchVal={searchVal} />;
  };

  it('initialized properly', () => {
    const wrapper = shallow(component());
    console.log(wrapper.find('form'));
  });
});
