import { render } from '@testing-library/react';

import { PhoneInput } from './PhoneInput';

describe('<PhoneInput />', () => {
  const props = {
    helperText: 'Your helper text',
    field: { name: 'example', value: '' },
    placeholder: 'Your phone number',
    form: {
      touched: { example: true },
      errors: { example: 'Please provide a valid number' },
      setFieldValue: null,
    },
  };
  const phoneInput = () => <PhoneInput {...props} />;

  test('It should render', () => {
    const { getByTestId } = render(phoneInput());
    expect(getByTestId('phoneInput')).toBeInTheDocument();
  });
});
