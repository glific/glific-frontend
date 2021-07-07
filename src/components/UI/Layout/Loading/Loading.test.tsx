import { render } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading test', () => {
  const createLoading = () => <Loading />;

  it('renders component properly', () => {
    const { getByTestId } = render(createLoading());
    expect(getByTestId('loader')).toBeInTheDocument();
  });
});
