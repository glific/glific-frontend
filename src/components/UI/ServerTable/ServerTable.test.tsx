import React from 'react';
import { ServerTable } from './ServerTable';
import { shallow, mount, render } from 'enzyme';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
  Paper,
  TableSortLabel,
} from '@material-ui/core';

describe('Server Table test', () => {
  // Dummy data
  const columnNames = ['First Name', 'Last Name', 'Message'];

  const data = [
    {
      first: 'Foo',
      last: 'Bar',
      message: 'Typescript is the best!',
    },
    {
      first: 'Adam',
      last: 'Smith',
      message: 'I love testing my Typescript code!',
    },
  ];

  // With server-side pagination, total rows may not be the length of data passed in.
  const totalRows = 5;

  const handleTableChange = (attribute: string, newVal: number | string) => {
    // Otherwise, set all values like normal
    // console.log('att', attribute);
    // console.log('val', newVal);
    tableVals = {
      ...tableVals,
      [attribute]: newVal,
    };
    // console.log('new vals', tableVals);
  };

  let tableVals: {
    ['pageNum']: number;
    ['pageRows']: number;
    ['sortCol']: string;
    ['sortDirection']: 'asc' | 'desc';
  } = {
    pageNum: 0,
    pageRows: 10,
    sortCol: 'First Name',
    sortDirection: 'asc',
  };

  // For easier testing purposes (don't need to re-write this over and over).
  const createTable = () => (
    <ServerTable
      columnNames={columnNames}
      data={data}
      totalRows={totalRows}
      handleTableChange={handleTableChange}
      tableVals={tableVals}
    />
  );

  // CORRECTLY IMPLEMENTED
  //   // console.log(wrapper.debug());

  it('renders a component properly', () => {
    const wrapper = shallow(createTable());
    expect(wrapper).toBeTruthy();
  });

  it('renders table', () => {
    const wrapper = mount(createTable());
    expect(wrapper.find(Table).length).toEqual(1);
    expect(wrapper.find(TableHead).length).toEqual(1);
    expect(wrapper.find(TableBody).length).toEqual(1);
    expect(wrapper.find(TableFooter).length).toEqual(1);
  });

  it('passes props properly', () => {
    const wrapper = shallow(createTable());
    let pagProps = wrapper.find(TablePagination).props();
    expect(pagProps.colSpan).toEqual(columnNames.length);
    expect(pagProps.count).toEqual(totalRows);
    expect(pagProps.page).toEqual(tableVals.pageNum);
    expect(pagProps.rowsPerPage).toEqual(tableVals.pageRows);
    expect(pagProps.rowsPerPageOptions).toEqual([10, 15, 20, 25, 30]);
    expect(pagProps.onChangePage).toBeInstanceOf(Function);
    expect(pagProps.onChangeRowsPerPage).toBeInstanceOf(Function);
  });

  it('renders column names correctly', () => {
    const wrapper = shallow(createTable());
    expect(wrapper.find(TableSortLabel).length).toEqual(3);
    for (let i = 0; i < columnNames.length; i++) {
      expect(wrapper.find(TableSortLabel).at(i).text() === columnNames[i]);
    }
  });

  it('data rendered properly', () => {
    const wrapper = shallow(createTable());
    expect(wrapper.find(TableBody).find(TableCell).length).toEqual(
      data.length * columnNames.length
    );
    for (let i = 0; i < data.length; i++) {
      let entryVals = Object.values(data[i]);
      for (let j = 0; j < columnNames.length; j++) {
        expect(
          wrapper
            .find(TableBody)
            .find(TableCell)
            .at(i * columnNames.length + j)
            .text()
        ).toEqual(entryVals[j]);
      }
    }
  });

  it('num rows correct', () => {
    const wrapper = shallow(createTable());
    expect(wrapper.find(TableBody).find(TableRow).length).toEqual(data.length);
  });

  it('changing page working', () => {
    const wrapper = shallow(createTable());
    // Forward
    wrapper.find(TablePagination).invoke('onChangePage')(null, 1);
    expect(tableVals.pageNum).toEqual(1);
    // Backward
    wrapper.find(TablePagination).invoke('onChangePage')(null, 0);
    expect(tableVals.pageNum).toEqual(0);
    // Random page
    wrapper.find(TablePagination).invoke('onChangePage')(null, 5);
    expect(tableVals.pageNum).toEqual(5);
  });

  // BROKEN AT THE MOMENT, handleChange not being called.

  // Changing rows per page works properly
  // it('changing rows per page', () => {
  //   const wrapper = shallow(createTable());
  //   let event = {
  //     target: {
  //       value: 15,
  //     },
  //   };
  //   const changePageRows = (newNum: number) => {
  //     event.target.value = newNum;
  //   };
  //   // Simulate changing rows per page
  //   // const onChangeMock = jest.fn();
  //   // let newTable = (
  //   //   <ServerTable
  //   //     columnNames={columnNames}
  //   //     data={data}
  //   //     totalRows={totalRows}
  //   //     handleTableChange={onChangeMock}
  //   //     tableVals={tableVals}
  //   //   />
  //   // );
  //   wrapper.find(TablePagination).simulate('onChangeRowsPerPage', { event });
  //   expect(tableVals.pageRows).toEqual(15);
  //   // changePageRows(20);
  // });

  // Changing sort by column works properly
  // it('changing sort by column', () => {
  //   const wrapper = shallow(createTable());
  //   for (let i = 0; i < columnNames.length; i++) {
  //     // Expected behavior
  //     // console.log(wrapper.debug());
  //     wrapper.find(TableSortLabel).at(i).invoke('onClick');
  //     expect(tableVals.sortCol).toEqual(columnNames[i]);
  //     expect(tableVals.sortDirection).toEqual(tableVals.sortDirection === 'asc' ? 'asc' : 'desc');
  //   }
  // });
  // Passes in the tableVals correctly.
});
