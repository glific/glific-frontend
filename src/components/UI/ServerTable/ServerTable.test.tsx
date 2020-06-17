import React from 'react';
import { ServerTable } from './ServerTable';
import { shallow, mount } from 'enzyme';
import { Table } from '@material-ui/core';

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

const totalRows = data.length;

const handleTableChange = () => console.log('Worked!');

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

describe('Table component', () => {
  it('renders properly', () => {
    const wrapper = shallow(
      <ServerTable
        columnNames={columnNames}
        data={data}
        totalRows={totalRows}
        handleTableChange={handleTableChange}
        tableVals={tableVals}
      />
    );
    expect(wrapper.find(Table)).toEqual({}); // wrong
  });
});
