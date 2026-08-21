import { render, screen, within } from '@testing-library/react';
import { DataTable } from './DataTable';

const columns = [{ label: 'Question' }, { label: 'Expected answer' }];

const rows = [
  { key: 'a', cells: ['What is anaemia?', 'Low haemoglobin.'] },
  { key: 'b', cells: ['What foods help?', 'Greens and lentils.'] },
];

test('renders a header per column and a row per entry', () => {
  render(<DataTable columns={columns} rows={rows} />);

  expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Question', 'Expected answer']);
  expect(screen.getAllByTestId('dataTableRow')).toHaveLength(2);
  expect(within(screen.getAllByTestId('dataTableRow')[0]).getAllByRole('cell')[1]).toHaveTextContent(
    'Low haemoglobin.'
  );
});

test('a column class is applied to its header and to every cell beneath it', () => {
  render(<DataTable columns={[{ label: 'Question', className: 'wide' }, { label: 'Answer' }]} rows={rows} />);

  expect(screen.getAllByRole('columnheader')[0]).toHaveClass('wide');
  expect(within(screen.getAllByTestId('dataTableRow')[0]).getAllByRole('cell')[0]).toHaveClass('wide');
});

test('cells may be elements, not just text', () => {
  render(
    <DataTable columns={columns} rows={[{ key: 'a', cells: [<span data-testid="pill">ANC</span>, 'An answer'] }]} />
  );

  expect(screen.getByTestId('pill')).toBeInTheDocument();
});

test('the ids callers query by can be overridden', () => {
  render(<DataTable columns={columns} rows={rows} testId="questions" rowTestId="questionRow" />);

  expect(screen.getByTestId('questions')).toBeInTheDocument();
  expect(screen.getAllByTestId('questionRow')).toHaveLength(2);
});

test('an empty set is simply an empty body', () => {
  render(<DataTable columns={columns} rows={[]} />);

  expect(screen.queryByTestId('dataTableEmpty')).not.toBeInTheDocument();
  expect(screen.queryAllByTestId('dataTableRow')).toHaveLength(0);
});

test('the scroll height can be set by the caller', () => {
  render(<DataTable columns={columns} rows={rows} maxHeight="10rem" />);

  expect(screen.getByTestId('dataTable')).toHaveStyle({ maxHeight: '10rem' });
});
