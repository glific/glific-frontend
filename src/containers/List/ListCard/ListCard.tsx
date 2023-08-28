import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { Fragment } from 'react';

import styles from './ListCard.module.css';

interface ListCardProps {
  data: any;
  columnStyles?: Array<any>;
}

export const ListCard = ({ data, columnStyles }: ListCardProps) => {
  const createRows = (data: any, columnStyles: any) => {
    const createRow = (entry: any) => {
      let stylesIndex = -1;
      delete entry.recordId;
      delete entry.isActive;

      return Object.keys(entry).map((item: any) => {
        // maintain columnStyles index
        stylesIndex += 1;
        return (
          <TableCell
            key={item + entry.recordId}
            className={`${columnStyles && columnStyles[stylesIndex]} ${styles.TableCell}`}
          >
            {entry[item]}
          </TableCell>
        );
      });
    };

    return data.map((entry: any) => {
      const isActiveRow = entry.isActive === false ? styles.InactiveRow : styles.ActiveRow;

      return (
        <Fragment key={entry.recordId}>
          <TableRow className={` ${isActiveRow} ${styles.TableRow}`}>{createRow(entry)}</TableRow>
        </Fragment>
      );
    });
  };

  const rows = createRows(data, columnStyles);

  return (
    <div className={styles.TableContainer}>
      <Table className={styles.Table} data-testid="listCardTable">
        <TableBody data-testid="listCardBody">{rows}</TableBody>
      </Table>
    </div>
  );
};

export default ListCard;
