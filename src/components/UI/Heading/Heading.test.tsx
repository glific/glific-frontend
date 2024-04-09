import { describe } from 'vitest';
import { Heading } from './Heading';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const wrapper = (
  <MemoryRouter>
    <Heading backLink={'/back-link'} formTitle={'Heading Title'} />
  </MemoryRouter>
);

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

describe('Heading', () => {
  test('it should have Heading Title as heading', async () => {
    const { getByText } = render(wrapper);

    await waitFor(() => {
      expect(getByText('Heading Title')).toBeInTheDocument();
    });
  });

  test('it should navigate to the back link', async () => {
    const { getByTestId } = render(wrapper);

    fireEvent.click(getByTestId('back-button'));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalled();
    });
  });
});
