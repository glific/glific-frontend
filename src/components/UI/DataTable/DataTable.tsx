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
  maxHeight?: string;
  className?: string;
  testId?: string;
  rowTestId?: string;
}

export const DataTable = ({
  columns,
  rows,
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
        {rows.map((row) => (
          <tr key={row.key} data-testid={rowTestId}>
            {row.cells.map((cell, index) => (
              <td key={`${row.key}-${index}`} className={columns[index]?.className}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
