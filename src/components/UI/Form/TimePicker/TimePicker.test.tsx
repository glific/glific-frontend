import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { TimePicker } from './TimePicker';
import { backspace } from 'common/test-utils';

const setFieldValueMock = jest.fn();
const timePickerProps: any = (disabled: boolean) => {
  return {
    placeholder: 'TimePicker',
    disabled,
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: setFieldValueMock },
  };
};

describe('<TimePicker />', () => {
  const props = timePickerProps(false);

  const wrapper = <TimePicker {...props} />;

  it('renders <TimePicker /> component', async () => {
    render(wrapper);
    const authContainer = screen.getByTestId('time-picker');
    expect(authContainer).toHaveTextContent('TimePicker');
  });
});

describe('<TimePicker />', () => {
  const props = timePickerProps(false);

  const wrapper = <TimePicker {...props} />;

  it('test empty time event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('test time change event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '09:00 am' } });
    expect(input).toHaveValue('09:00 am');
  });

  it('test display time picker on icon click', async () => {
    render(wrapper);
    const input = screen.getByRole('button');
    fireEvent.click(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should set the field value to null if no date is passed', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1' } });
    backspace(input);

    expect(setFieldValueMock).toBeCalledWith('example', null);
  });

  it('should close the timepicker if we click escape', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.click(input);

    expect(screen.getByTestId('sentinelStart')).toBeInTheDocument();

    fireEvent.keyDown(input, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });
    await waitFor(() => {
      expect(screen.queryByTestId('sentinelStart')).not.toBeInTheDocument();
    });
  });

  it('should show error if error is passed', async () => {
    const props = timePickerProps(false);
    delete props.disabled;
    props.form.errors = {
      example: 'Please enter correct time',
    };
    props.form.touched = {
      example: true,
    };
    render(<TimePicker {...props} />);
    expect(screen.getByText('Please enter correct time')).toBeInTheDocument();
  });
});

describe('Disable <TimePicker />', () => {
  const props = timePickerProps(true);
  const wrapper = <TimePicker {...props} />;

  it('test time change event not allow', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '09:00 AM');
    expect(input).toHaveValue('');
  });

  it('test do not display time picker on icon click', async () => {
    render(wrapper);
    const input = screen.getByRole('button');
    fireEvent.click(input);
    expect(screen.queryByRole('dialog')).toEqual(null);
  });
});
