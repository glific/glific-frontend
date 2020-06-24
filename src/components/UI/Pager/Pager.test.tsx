import React, { ChangeEvent } from 'react';
import { Pager } from './Pager';
import { shallow, mount } from 'enzyme';
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
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
    pageRows: 10,
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
    />
  );

  // TEST CASES

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

  it('passes in tableVals correctly', () => {
    const wrapper = shallow(createTable());
    expect(wrapper.find(TablePagination).prop('page')).toEqual(tableVals.pageNum);
    expect(wrapper.find(TablePagination).prop('rowsPerPage')).toEqual(tableVals.pageRows);
    let sortLabel = wrapper
      .find(TableSortLabel)
      .findWhere((obj) => obj.text() === tableVals.sortCol)
      .at(0);
    expect(sortLabel.prop('active')).toEqual(true);
    expect(sortLabel.prop('direction')).toEqual(tableVals.sortDirection);
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
  });

  it('changing rows per page', () => {
    const wrapper = mount(createTable());
    let event = {
      target: {
        value: '15',
      },
    };
    const changePageRows = (newNum: string) => {
      event.target.value = newNum;
    };
    wrapper.find(TablePagination).prop('onChangeRowsPerPage')!(
      event as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    );
    expect(tableVals.pageRows).toEqual(15);
    changePageRows('30');
    wrapper.find(TablePagination).prop('onChangeRowsPerPage')!(
      event as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    );
    expect(tableVals.pageRows).toEqual(30);
    changePageRows('10');
    wrapper.find(TablePagination).prop('onChangeRowsPerPage')!(
      event as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    );
    expect(tableVals.pageRows).toEqual(10);
  });

  it('changing sort by column', () => {
    const wrapper = mount(createTable());
    for (let i = 0; i < columnNames.length; i++) {
      wrapper.find('span.MuiTableSortLabel-root').at(i).simulate('click');
      expect(tableVals.sortCol).toEqual(columnNames[i]);
      expect(tableVals.sortDirection).toEqual(tableVals.sortDirection === 'asc' ? 'asc' : 'desc');
    }
  });
});
