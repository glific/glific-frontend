import { render, screen, fireEvent } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';

import { TimePicker } from './TimePicker';

const setFieldValueMock = vi.fn();
const timePickerProps: any = (disabled: boolean) => {
  return {
    placeholder: 'TimePicker',
    disabled,
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: setFieldValueMock },
  };
};

const cleanText = (timeValue: any) => timeValue.replace(/\u200e|\u2066|\u2067|\u2068|\u2069/g, '');

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
    fireEvent.change(input, { target: { value: '09:00 AM' } });
    expect(cleanText(input.getAttribute('value'))).toBe('09:00 AM');
  });

  it('should set the field value to null if no date is passed', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
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
});
