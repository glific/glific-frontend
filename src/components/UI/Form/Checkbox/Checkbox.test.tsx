import { render, screen, fireEvent } from '@testing-library/react';

import { Checkbox } from './Checkbox';

describe('<Checkbox />', () => {
  const props = {
    title: 'Example',
    field: { name: 'example', value: false },
    form: { dirty: false, touched: false, errors: false, setFieldValue: function () {} },
    handleChange: function () {},
  };

  const wrapper = <Checkbox {...props} />;

  it('test for dafault value', async () => {
    render(wrapper);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('test for check and uncheck', async () => {
    render(wrapper);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.change(checkbox, { target: { value: 'true' } });
    expect(checkbox.value).toBe('true');

    fireEvent.change(checkbox, { target: { value: 'false' } });
    expect(checkbox.value).toBe('false');

    fireEvent.click(checkbox);
    expect(wrapper.props.field.value).toBe(false);
  });
});
