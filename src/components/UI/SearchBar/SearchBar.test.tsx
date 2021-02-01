import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('<SearchBar/>', () => {
  const mockChange = jest.fn();
  const mockSubmit = jest.fn();
  const mockReset = jest.fn();

  const component = (searchValue: any) => (
    <SearchBar
      handleChange={mockChange}
      handleSubmit={mockSubmit}
      onReset={mockReset}
      searchVal={searchValue}
      searchMode={true}
    />
  );

  it('initialized properly', () => {
    const { getByTestId } = render(component(''));
    expect(getByTestId('searchForm')).toBeInTheDocument();
  });

  it('submit callback works properly', () => {
    const { getByTestId } = render(component(''));
    fireEvent.submit(getByTestId('searchForm'));
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('reset callback works properly', () => {
    const { getByTestId } = render(component('hello There'));
    fireEvent.click(getByTestId('resetButton'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('change in local search val renders change', () => {
    const { getByPlaceholderText } = render(component(''));
    fireEvent.change(getByPlaceholderText('Search'), { target: { value: 'new val' } });
    expect(mockChange).toHaveBeenCalled();
  });

  it('className gets passed in properly for additional styling', () => {
    const { container } = render(
      <SearchBar
        handleChange={mockChange}
        handleSubmit={mockSubmit}
        onReset={mockReset}
        className={'mockClassName'}
      />
    );
    expect(container.querySelector('.mockClassName')).toBeInTheDocument();
  });
});
