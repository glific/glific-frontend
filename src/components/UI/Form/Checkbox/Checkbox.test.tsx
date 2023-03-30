import { render, screen, fireEvent } from '@testing-library/react';

import { Checkbox } from './Checkbox';

const handleChangeMock = vi.fn();
const setFieldMock = vi.fn();

describe('<Checkbox />', () => {
  const getProps: any = () => ({
    title: 'Example',
    field: { name: 'example', value: false },
    form: { dirty: false, touched: false, errors: false, setFieldValue: setFieldMock },
    handleChange: handleChangeMock,
  });

  const wrapper = <Checkbox {...getProps()} />;

  it('test for dafault value', async () => {
    render(wrapper);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('test for check and uncheck', async () => {
    render(wrapper);
    const checkbox: HTMLInputElement = screen.getByRole('checkbox');
    fireEvent.change(checkbox, { target: { value: 'true' } });
    expect(checkbox.value).toBe('true');

    fireEvent.change(checkbox, { target: { value: 'false' } });
    expect(checkbox.value).toBe('false');

    fireEvent.click(checkbox);
    expect(wrapper.props.field.value).toBe(false);
  });

  it('tests handleChange not called if not defined', async () => {
    const props = getProps();
    delete props.handleChange;
    render(<Checkbox {...props} />);
    const checkbox: HTMLInputElement = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(setFieldMock).toBeCalled();
    expect(handleChangeMock).toBeCalledTimes(1);
  });

  it('should trigger the dialog box if info type is dialog', async () => {
    const handleInfoClickMock = vi.fn();
    const props = getProps();
    props.info = { title: 'dialog' };
    props.infoType = 'dialog';
    props.handleInfoClick = handleInfoClickMock;
    render(<Checkbox {...props} />);
    const infoIcon: HTMLInputElement = screen.getByTestId('info-icon');
    fireEvent.click(infoIcon);
    expect(handleInfoClickMock).toBeCalled();
  });
});
