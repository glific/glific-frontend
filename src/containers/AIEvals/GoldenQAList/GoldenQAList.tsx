import { useLazyQuery } from '@apollo/client';
import {
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';

import DocumentIcon from 'assets/images/icons/Document/Light.svg?react';
import DownloadIcon from 'assets/images/icons/Download.svg?react';
import { COUNT_GOLDEN_QA, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import styles from './GoldenQAList.module.css';

dayjs.extend(relativeTime);

interface GoldenQa {
  id: string;
  name: string;
  datasetId: string;
  insertedAt: string;
}

interface GoldenQAListProps {
  searchQuery: string;
}

type SortDirection = 'asc' | 'desc';

export const GoldenQAList = ({ searchQuery }: GoldenQAListProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortCol, setSortCol] = useState<'name' | 'inserted_at'>('inserted_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const queryOpts = {
    filter: searchQuery ? { name: searchQuery } : {},
    opts: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      orderWith: sortCol,
      order: sortDirection.toUpperCase(),
    },
  };

  const [fetchList, { data, loading }] = useLazyQuery(LIST_GOLDEN_QA, { fetchPolicy: 'network-only' });
  const [fetchCount, { data: countData }] = useLazyQuery(COUNT_GOLDEN_QA, { fetchPolicy: 'network-only' });

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  useEffect(() => {
    fetchList({ variables: queryOpts });
    fetchCount({ variables: { filter: queryOpts.filter } });
  }, [searchQuery, page, rowsPerPage, sortCol, sortDirection]);

  const rows: GoldenQa[] = data?.goldenQas ?? [];
  const totalCount: number = countData?.countGoldenQas ?? 0;

  const handleSort = (col: 'name' | 'inserted_at') => {
    if (sortCol === col) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDirection('asc');
    }
  };

  const handleDownload = (row: GoldenQa) => {
    // TODO: implement download once backend provides a download endpoint for datasetId
    void row;
  };

  const renderSkeletonRows = () =>
    Array.from({ length: rowsPerPage }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" width={100} /></TableCell>
        <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
      </TableRow>
    ));

  return (
    <div className={styles.Container}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow className={styles.HeaderRow}>
              <TableCell className={styles.HeaderCell}>
                <TableSortLabel
                  active={sortCol === 'name'}
                  direction={sortCol === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.HeaderCell}>
                <TableSortLabel
                  active={sortCol === 'inserted_at'}
                  direction={sortCol === 'inserted_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('inserted_at')}
                >
                  Created On
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.HeaderCell} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className={styles.EmptyCell}>
                  No Golden QA datasets found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className={styles.DataRow}>
                  <TableCell className={styles.TitleCell}>
                    <DocumentIcon className={styles.DocumentIcon} />
                    {row.name}
                  </TableCell>
                  <TableCell className={styles.DateCell}>{dayjs(row.insertedAt).fromNow()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label={`Download ${row.name}`}
                      onClick={() => handleDownload(row)}
                      className={styles.DownloadButton}
                      size="small"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
        labelDisplayedRows={({ from, to, count }) => `${String(from).padStart(2, '0')}-${String(to).padStart(2, '0')} of ${count}`}
      />
    </div>
  );
};
