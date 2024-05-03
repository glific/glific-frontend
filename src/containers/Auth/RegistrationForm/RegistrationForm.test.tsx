import { MemoryRouter, Route, Routes } from 'react-router';
import RegistrationForm from './ResgistrationForm';
import { fireEvent, render, waitFor } from '@testing-library/react';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

const renderForm = (id: number) => (
  <MemoryRouter initialEntries={[`/registration/${id}`]}>
    <Routes>
      <Route path="/registration/:step" element={<RegistrationForm />} />
    </Routes>
  </MemoryRouter>
);

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(1));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Glific platform details');
  });
});

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(2));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('About the organization');
  });
});

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(3));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Payment details');
  });
});

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(4));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Submitter & Signing authority details');
  });

  fireEvent.click(getByTestId('back-button'));
});
