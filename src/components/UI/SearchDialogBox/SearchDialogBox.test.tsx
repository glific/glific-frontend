import React from 'react';

import {render} from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SearchDialogBox } from './SearchDialogBox';
import { DialogBox } from '../DialogBox/DialogBox';
import { AutoComplete } from '../Form/AutoComplete/AutoComplete';


const mockHandleOk=jest.fn()
const mockHandleCancel=jest.fn()
const mockHandleChange=jest.fn()
const defaultProps = {
  title: 'Search Box',
  handleOk: mockHandleOk,
  handleCancel: mockHandleCancel,
  onChange:mockHandleChange,
  options: [{ id: '1', label: 'something' }],
  selectedOptions: ['1'],
};
<<<<<<< HEAD

let wrapper:any;

beforeEach(()=>{
   wrapper = render(
    <MockedProvider>
      <SearchDialogBox {...defaultProps} />
    </MockedProvider>
  );
})


test('it should render the title correctly', () => {
  expect(wrapper.getByTestId("dialogTitle")).toHaveTextContent('Search Box')
});

test('it should contain the selected option', () => {
  expect(wrapper.getByTestId("searchChip").querySelector('span')).toHaveTextContent('something');
});


=======
const searchDialogBox =(props:any)=> (
  <MockedProvider>
    <SearchDialogBox {...defaultProps} {...props} />
  </MockedProvider>
);

test('it should render the title correctly', () => {
  const wrapper=mount(searchDialogBox([]))
  expect(wrapper.find('div[data-testid="dialogTitle"]').text()).toEqual('Search Box');
});

test('it should contain the selected option', () => {
  const wrapper=mount(searchDialogBox([]))
  expect(wrapper.find('div[data-testid="searchChip"] span').text()).toEqual('something');
});


test('dialog handleOk', () => {
  const wrapper=mount(searchDialogBox({}))
  wrapper.find(DialogBox).prop('handleOk')()
  expect(mockHandleOk).toBeCalled()
});


test('dialog handleOk with async search', () => {
  const wrapper=mount(searchDialogBox({asyncSearch:true}))
  wrapper.find(DialogBox).prop('handleOk')()
  expect(mockHandleOk).toBeCalled()
});

test('input value change', () => {
  const wrapper=mount(searchDialogBox({asyncSearch:true}))
  wrapper.find(AutoComplete).prop('onChange')('hi')
  expect(mockHandleChange).toBeCalled()
});
>>>>>>> upstream/upgrade-packages
