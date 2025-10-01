import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { TimePicker } from './TimePicker';

afterEach(() => {
  (window as any).matchMedia = null;
});

const setFieldValueMock = vi.fn();
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
    const container = render(wrapper);
    const input = container.queryByTestId('TimePicker');
    expect(input).toHaveValue('');
  });

  it.skip('test time change event', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('TimePicker');
    if (input) {
      fireEvent.change(input, { target: { value: '09:00 AM' } });
    }

    await waitFor(() => {
      expect(input).toHaveValue('09:00 AM');
    });
  });

  it('should set the field value to null if no date is passed', async () => {
    const container = render(wrapper);
    const input = container.queryByTestId('TimePicker');
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
    const container = render(wrapper);
    const input = container.queryByTestId('TimePicker');
    if (input) {
      UserEvent.type(input, '09:00 AM');
    }
    expect(input).toHaveValue('');
  });
});
