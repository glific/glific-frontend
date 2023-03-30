import { Pager } from './Pager';
import { render } from '@testing-library/react';

describe('Server Table test', () => {
  // Dummy data
  const columnNames = [
    { name: 'first_name', label: 'First Name' },
    { name: 'last_name', label: 'Last Name' },
    { name: 'message', label: 'Message' },
  ];

  const data = [
    {
      recordId: '1',
      first: 'Foo',
      last: 'Bar',
      message: 'Typescript is the best!',
    },
    {
      recordId: '2',
      first: 'Adam',
      last: 'Smith',
      message: 'I love testing my Typescript code!',
    },
  ];

  // With server-side pagination, total rows may not be the length of data passed in.
  const totalRows = 5;

  const handleTableChange = (attribute: string, newVal: number | string) => {
    tableVals = {
      ...tableVals,
      [attribute]: newVal,
    };
  };

  let tableVals: {
    ['pageNum']: number;
    ['pageRows']: number;
    ['sortCol']: string;
    ['sortDirection']: 'asc' | 'desc';
  } = {
    pageNum: 0,
    pageRows: 50,
    sortCol: 'First Name',
    sortDirection: 'asc',
  };

  // For easier testing purposes (don't need to re-write this over and over).
  const createTable = () => (
    <Pager
      columnNames={columnNames}
      data={data}
      totalRows={totalRows}
      handleTableChange={handleTableChange}
      tableVals={tableVals}
      collapseOpen={false}
      collapseRow={undefined}
    />
  );

  // TEST CASES

  it('renders a component properly', () => {
    const wrapper = render(createTable());
    expect(wrapper).toBeTruthy();
  });

  it('renders table', () => {
    const wrapper = render(createTable());
    expect(wrapper.getByTestId('table')).toBeInTheDocument();
    expect(wrapper.getByTestId('tableHead')).toBeInTheDocument();
    expect(wrapper.getByTestId('tableBody')).toBeInTheDocument();
    expect(wrapper.getByTestId('tableFooter')).toBeInTheDocument();
  });

  // it('passes props properly', () => {
  //   const wrapper = render(createTable());
  //   let pagProps = wrapper.find(TablePagination).props();
  //   expect(pagProps.colSpan).toEqual(columnNames.length);
  //   expect(pagProps.count).toEqual(totalRows);
  //   expect(pagProps.page).toEqual(tableVals.pageNum);
  //   expect(pagProps.rowsPerPage).toEqual(tableVals.pageRows);
  //   expect(pagProps.rowsPerPageOptions).toEqual([10, 15, 20, 25, 30]);
  //   expect(pagProps.onChangePage).toBeInstanceOf(Function);
  //   expect(pagProps.onChangeRowsPerPage).toBeInstanceOf(Function);
  // });

  it('passes in tableVals correctly', () => {
    const wrapper = render(createTable());
    expect(
      wrapper.getByTestId('tableFooter').querySelectorAll('.MuiTablePagination-displayedRows')[0]
    ).toHaveTextContent('1–5 of 5');
    expect(
      wrapper.getByTestId('tableFooter').querySelector('.MuiTablePagination-select')
    ).toHaveTextContent('50');
  });

  it('renders column names correctly', () => {
    const wrapper = render(createTable());
    for (let i = 0; i < columnNames.length - 1; i++) {
      expect(wrapper.getByText(columnNames[i].label)).toBeInTheDocument();
    }
  });

  //   it('data rendered properly', () => {
  //     const wrapper = render(createTable());
  //     expect(wrapper.find(TableBody).find(TableCell).length).toEqual(
  //       data.length * columnNames.length
  //     );
  //     for (let i = 0; i < data.length; i++) {
  //       let entryVals = Object.values(data[i]);
  //       for (let j = 0; j < columnNames.length; j++) {
  //         expect(
  //           wrapper
  //             .find(TableBody)
  //             .find(TableCell)
  //             .at(i * columnNames.length + j)
  //             .text()
  //         ).toEqual(entryVals[j]);
  //       }
  //     }
  //   });

  it('num rows correct', () => {
    const wrapper = render(createTable());
    expect(wrapper.getByTestId('tableBody').querySelectorAll('.MuiTableRow-root').length).toEqual(
      data.length
    );
  });

  // it('changing page working', () => {

  //   const wrapper = render(createTable());
  //   // Forward
  //   wrapper.getByTitle('Next page');
  //   expect(tableVals.pageNum).toEqual(1);
  //   // Backward
  //   wrapper.find(TablePagination).invoke('onChangePage')(null, 0);
  //   expect(tableVals.pageNum).toEqual(0);
  // });

  //   it('changing rows per page', () => {
  //     const wrapper = render(createTable());
  //     let event = {
  //       target: {
  //         value: '15',
  //       },
  //     };
  //     const changePageRows = (newNum: string) => {
  //       event.target.value = newNum;
  //     };
  //     wrapper.find(TablePagination).prop('onChangeRowsPerPage')!(
  //       event as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  //     );
  //     expect(tableVals.pageRows).toEqual(15);
  //     changePageRows('30');
  //     wrapper.find(TablePagination).prop('onChangeRowsPerPage')!(
  //       event as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  //     );
  //     expect(tableVals.pageRows).toEqual(30);
  //     changePageRows('10');
  //     wrapper.find(TablePagination).prop('onChangeRowsPerPage')!(
  //       event as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  //     );
  //     expect(tableVals.pageRows).toEqual(10);
  //   });

  //   it('changing sort by column', () => {
  //     const wrapper = render(createTable());
  //     for (let i = 0; i < columnNames.length - 1; i++) {
  //       wrapper.find('span.MuiTableSortLabel-root').at(i).simulate('click');
  //       expect(tableVals.sortCol).toEqual(columnNames[i]);
  //       expect(tableVals.sortDirection).toEqual(tableVals.sortDirection === 'asc' ? 'asc' : 'desc');
  //     }
  //   });
});
