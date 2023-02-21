import { render, screen, fireEvent } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';

import { TimePicker } from './TimePicker';

const timePickerProps = (disabled: boolean) => {
  return {
    placeholder: 'TimePicker',
    disabled,
    field: { name: 'example', value: null },
    form: { dirty: false, touched: false, errors: false, setFieldValue: function () {} },
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
    fireEvent.change(input, { target: { value: '09:00 AM' } });
    expect(input).toHaveValue('09:00 AM');
  });

  it('test display time picker on icon click', async () => {
    render(wrapper);
    const input = screen.getByRole('button');
    fireEvent.click(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
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
