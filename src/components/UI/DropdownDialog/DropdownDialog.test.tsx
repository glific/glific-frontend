import React from 'react';
import {fireEvent, render} from "@testing-library/react"
import { DropdownDialog } from './DropdownDialog';
import { DialogBox } from '../DialogBox/DialogBox';
import { Dropdown } from '../Form/Dropdown/Dropdown';
import { Select } from '@material-ui/core';
import { act } from 'react-dom/test-utils';

const mockCallbackCancel = jest.fn();
const mockCallbackOK = jest.fn();
const dialogBox = (
  <DropdownDialog
    title="Default dialog"
    handleOk={mockCallbackOK}
    handleCancel={mockCallbackCancel}
    options={[{ id: '1', label: 'default' }]}
    description="This is default dialog"
  ></DropdownDialog>
);

test('it should contain a dropdown', () => {
  const {getByTestId} = render(dialogBox);
  expect(getByTestId('dropdown')).toBeInTheDocument();
});

test('it should have a description as per default value', () => {
  const {getByTestId} = render(dialogBox);
  expect(getByTestId('description')).toHaveTextContent('This is default dialog');
});

test('handleOk and onChange function', () => {
  const {getByTestId} = render(dialogBox);
 fireEvent.click(getByTestId('ok-button'))
  expect(mockCallbackOK).toBeCalled();

  // need to check how to mock these in RTL

  // act(() => {
  //   wrapper
  //     .find(Select)
  //     .at(0)
  //     .props()
  //     .onChange({ target: { value: 1 } });
  // });
});
