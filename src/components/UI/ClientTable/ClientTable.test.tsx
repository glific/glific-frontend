import React from 'react';
import { ClientTable } from './ClientTable';
import { shallow } from 'enzyme';

const columns = [
  {
    name: 'First Name',
    selector: 'first',
    sortable: true,
  },
  {
    name: 'Last Name',
    selector: 'last',
    sortable: false,
  },
  {
    name: 'Message',
    selector: 'message',
    sortable: false,
  },
];

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

describe('Table component', () => {
  it('initialized properly', () => {
    const wrapper = shallow(<ClientTable columns={columns} data={data} />);
  });
});
