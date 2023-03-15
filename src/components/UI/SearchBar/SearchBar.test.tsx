import { fireEvent, render, waitFor } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('<SearchBar/>', () => {
  const mockChange = vi.fn();
  const mockSubmit = vi.fn();
  const mockReset = vi.fn();

  const component = (searchValue: any, searchMode: boolean = true) => (
    <SearchBar
      handleChange={mockChange}
      handleSubmit={mockSubmit}
      onReset={mockReset}
      searchVal={searchValue}
      searchMode={searchMode}
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

  it('reset callback works properly', async () => {
    const { getByTestId } = render(component('hello There', false));
    await waitFor(() => {
      fireEvent.click(getByTestId('resetButton'));
    });
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
        searchMode={true}
      />
    );
    expect(container.querySelector('.mockClassName')).toBeInTheDocument();
  });
});
