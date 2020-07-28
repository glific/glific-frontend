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
    expect(wrapper.exists()).toBe(true);
  });

  // Searchbar take in className

  // Submit is called
  // Reset is called
  // Change in local search val?
  // Default search val without input
  // Default search val with input
});
