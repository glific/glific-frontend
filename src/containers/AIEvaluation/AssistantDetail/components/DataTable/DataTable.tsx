import { ReactNode } from 'react';
import styles from './DataTable.module.css';

export interface DataTableColumn {
  label: ReactNode;
  className?: string;
}

export interface DataTableRow {
  key: string;
  cells: ReactNode[];
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  emptyText?: ReactNode;
  maxHeight?: string;
  className?: string;
  testId?: string;
  rowTestId?: string;
}

/**
 * A scrollable table with a sticky header, for data already in hand. Callers pass the header
 * labels and the cells; anything about how a cell reads — a pill, muted text — belongs in the
 * cell itself, so the same table can be reused wherever the styling should match.
 */
export const DataTable = ({
  columns,
  rows,
  emptyText,
  maxHeight,
  className,
  testId = 'dataTable',
  rowTestId = 'dataTableRow',
}: DataTableProps) => (
  <div
    className={`${styles.Wrap} ${className ?? ''}`}
    style={maxHeight ? { maxHeight } : undefined}
    data-testid={testId}
  >
    <table className={styles.Table}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={`column-${index}`} className={column.className}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && emptyText ? (
          <tr data-testid={`${testId}Empty`}>
            <td className={styles.Empty} colSpan={columns.length}>
              {emptyText}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.key} data-testid={rowTestId}>
              {row.cells.map((cell, index) => (
                <td key={`${row.key}-${index}`} className={columns[index]?.className}>
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;
