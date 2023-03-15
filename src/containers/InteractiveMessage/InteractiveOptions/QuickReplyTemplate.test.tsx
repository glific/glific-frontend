import { fireEvent, render, screen } from '@testing-library/react';

import { QuickReplyTemplate } from './QuickReplyTemplate';

const inputFields = [{ value: '' }, { value: '' }];

const form = {
  errors: {},
  touched: {},
  values: {
    templateButtons: inputFields,
  },
};

const props: any = {
  index: 0,
  inputFields,
  form,
  onAddClick: vi.fn(),
  onRemoveClick: vi.fn(),
  onInputChange: vi.fn(),
};

test('it should render template', async () => {
  render(<QuickReplyTemplate {...props} />);

  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();

  fireEvent.change(input, { target: { value: 'Allow' } });
  fireEvent.blur(input);
});

const errorForm = {
  errors: {
    templateButtons: [{ value: 'Required' }, { value: 'Required' }],
  },
  touched: {
    templateButtons: inputFields,
  },
  values: {
    templateButtons: inputFields,
  },
};

test('it should render template with error', async () => {
  props.form = errorForm;
  render(<QuickReplyTemplate {...props} />);

  const button = screen.getByTestId('cross-icon');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);

  expect(props.onRemoveClick).toBeCalled();
});
