import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import { DropdownDialog } from './DropdownDialog';

vi.mock('../Form/Dropdown/Dropdown', () => {
  return {
    Dropdown: (...props: any) => {
      return (
        <div data-testid="dropdown">
          <input
            data-testid="mock-select"
            onChange={(event) => {
              props[0].field.onChange(event);
              mockCallbackChange();
            }}
          ></input>
        </div>
      );
    },
  };
});

const mockCallbackCancel = vi.fn();
const mockCallbackOK = vi.fn();
const mockCallbackChange = vi.fn();
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
  const { getByTestId } = render(dialogBox);
  expect(getByTestId('dropdown')).toBeInTheDocument();
});

test('it should have a description as per default value', () => {
  const { getByTestId } = render(dialogBox);
  expect(getByTestId('description')).toHaveTextContent('This is default dialog');
});

test('handleOk and onChange function', () => {
  const { getByTestId } = render(dialogBox);

  fireEvent.change(getByTestId('mock-select'), {
    target: {
      value: 10,
    },
  });

  expect(mockCallbackChange).toBeCalled();

  fireEvent.click(getByTestId('ok-button'));
  expect(mockCallbackOK).toBeCalled();
});
