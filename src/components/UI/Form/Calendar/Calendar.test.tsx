import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calendar } from './Calendar';

const setFieldValueMock = jest.fn();
describe('<Calendar />', () => {
  const getProps = () => ({
    name: 'dateFrom',
    type: 'date',
    placeholder: 'Date from',
    label: 'Date range',
    field: { name: 'example', value: 'cs' },
    form: {
      dirty: false,
      touched: {},
      errors: {},
      setFieldValue: setFieldValueMock,
    },
  });

  const wrapper = <Calendar {...getProps()} />;

  it('renders <Calendar /> component', async () => {
    render(wrapper);
    const authContainer = screen.getByTestId('date-picker-inline');
    expect(authContainer).toHaveTextContent('Date from');
  });

  it('test empty date event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('test date change event', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '09/03/2020' } });
    expect(input).toHaveValue('09/03/2020');
  });

  function backspace(element: any) {
    let actuallyTyped = element.value;

    const backspaceKey = {
      key: 'Backspace',
      code: 8,
      inputType: 'deleteContentBackward',
    };

    const sharedEventConfig = {
      key: backspaceKey.key,
      charCode: backspaceKey.code,
      keyCode: backspaceKey.code,
      which: backspaceKey.code,
    };
    const downEvent = fireEvent.keyDown(element, sharedEventConfig);

    if (downEvent) {
      actuallyTyped = actuallyTyped.slice(0, -1);

      fireEvent.input(element, {
        target: { value: actuallyTyped },
        inputType: backspaceKey.inputType,
        bubbles: true,
        cancelable: true,
      });
    }

    fireEvent.keyUp(element, sharedEventConfig);
  }

  it('should set the field value to null if no date is passed', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1' } });
    backspace(input);

    expect(setFieldValueMock).toBeCalledWith('example', null);
  });

  it('should set the field value to null if no date is passed', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1' } });
    backspace(input);

    expect(setFieldValueMock).toBeCalledWith('example', null);
  });

  it('should show error if error is passed', async () => {
    const props = getProps();
    props.form.errors = {
      example: 'Please enter correct date',
    };
    props.form.touched = {
      example: true,
    };

    render(<Calendar {...props} />);
    expect(screen.getByText('Please enter correct date')).toBeInTheDocument();
  });

  it('should call open the calendar if input is clicked', async () => {
    render(wrapper);
    const input = screen.getByRole('textbox');
    fireEvent.click(input);
    expect(screen.getByTestId('sentinelStart')).toBeInTheDocument();
  });

  it('should close the calendar if we click escape', async () => {
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
});
