import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { hsmGroupedTemplates, hsmMultiLanguageTemplate } from 'mocks/Template';
import HSMExpandableTable from './HSMExpandableTable';

vi.mock('i18next', () => ({ t: (str: string) => str }));

const mockedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedNavigate,
}));

Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

const renderTable = (templates = hsmGroupedTemplates) =>
  render(
    <MemoryRouter>
      <HSMExpandableTable templates={templates} />
    </MemoryRouter>
  );

test('renders empty state when no templates', () => {
  renderTable([]);
  expect(screen.getByTestId('emptyState')).toBeInTheDocument();
});

test('renders template labels', () => {
  renderTable();
  expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  expect(screen.getByText('Feedback Form')).toBeInTheDocument();
});

test('renders tag pill when tag is present', () => {
  renderTable();
  expect(screen.getByText('Messages')).toBeInTheDocument();
});

test('does not render tag pill when tag is null', () => {
  renderTable([hsmGroupedTemplates[1]]);
  expect(screen.queryByText('Messages')).not.toBeInTheDocument();
});

test('expands row to show language variants on click', () => {
  renderTable();

  expect(screen.queryByText('Hi {{1}}, welcome!')).not.toBeInTheDocument();

  fireEvent.click(screen.getByText('Welcome Message'));

  expect(screen.getByText('Hi {{1}}, welcome!')).toBeInTheDocument();
  expect(screen.getByText('नमस्ते {{1}}, स्वागत है!')).toBeInTheDocument();
});

test('collapses row on second click', () => {
  renderTable();

  fireEvent.click(screen.getByText('Welcome Message'));
  expect(screen.getByText('Hi {{1}}, welcome!')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Welcome Message'));
  expect(screen.queryByText('Hi {{1}}, welcome!')).not.toBeInTheDocument();
});

test('multiple rows can be expanded independently', () => {
  renderTable();

  fireEvent.click(screen.getByText('Welcome Message'));
  fireEvent.click(screen.getByText('Feedback Form'));

  expect(screen.getByText('Hi {{1}}, welcome!')).toBeInTheDocument();
  expect(screen.getByText('Please share your feedback.')).toBeInTheDocument();
});

test('renders language chips for each template group', () => {
  renderTable();
  expect(screen.getAllByText('EN').length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText('HI')).toBeInTheDocument();
});

test('shows +N overflow chip when more than 4 variants', () => {
  renderTable([hsmMultiLanguageTemplate]);
  expect(screen.getByText('+1')).toBeInTheDocument();
});

test('navigates to edit page when view button is clicked', () => {
  renderTable();

  const viewBtns = screen.getAllByTestId('viewBtn');
  fireEvent.click(viewBtns[0]);

  expect(mockedNavigate).toHaveBeenCalledWith('/template/1/edit');
});

test('navigates to add-language page when add language button is clicked', () => {
  renderTable();

  const addLangBtns = screen.getAllByTestId('addLanguageBtn');
  fireEvent.click(addLangBtns[0]);

  expect(mockedNavigate).toHaveBeenCalledWith('/template-v2/add', {
    state: { mode: 'add-language', shortcode: 'welcome_msg' },
  });
});

test('shows category badge for each template group', () => {
  renderTable();
  expect(screen.getByText(/Utility/)).toBeInTheDocument();
  expect(screen.getByText('Marketing')).toBeInTheDocument();
});

test('header row renders column labels', () => {
  renderTable();
  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Languages')).toBeInTheDocument();
  expect(screen.getByText('Category')).toBeInTheDocument();
  expect(screen.getByText('Last Updated')).toBeInTheDocument();
});
