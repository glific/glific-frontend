import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';

import { InteractiveOptions } from './InteractiveOptions';

const templateType = ['LIST', 'QUICK_REPLY'];
const inputFields: any = [
  {
    title: 'section 1',
    options: [
      { title: 'title 1', description: 'description 1' },
      { title: '', description: '' },
    ],
  },
  {
    title: 'section 2',
    options: [
      { title: '', description: '' },
      { title: '', description: '' },
    ],
  },
];

const props: any = {
  isAddButtonChecked: true,
  templateType: templateType[0],
  inputFields,
  form: {
    touched: { globalButton: true },
    errors: { globalButton: 'Required' },
    values: { templateButtons: inputFields },
    setFieldValue: vi.fn(),
  },
  onAddClick: vi.fn(),
  onRemoveClick: vi.fn(),
  onInputChange: vi.fn(),
  onTemplateTypeChange: vi.fn(),
  onListItemAddClick: vi.fn(),
  onListItemRemoveClick: vi.fn(),
  onGlobalButtonInputChange: vi.fn(),
};

const mock = vi.fn();

test('it render interactive options for list reply template', async () => {
  render(
    <Formik initialValues={{ templateButtons: inputFields }} onSubmit={mock}>
      <InteractiveOptions {...props} />
    </Formik>
  );

  const textboxes = screen.getAllByRole('textbox');
  const inputData = ['show', 'section 1', 'title 1', 'desc 1', 'section 2', 'title 2', 'desc 2'];
  let count = 0;

  for await (let input of textboxes) {
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: inputData[count] } });
    await waitFor(() => {});
    count++;
  }

  const [addAnotherList, addAnotherListItem] = screen.getAllByRole('button');
  expect(addAnotherListItem).toBeInTheDocument();
  expect(addAnotherList).toBeInTheDocument();

  fireEvent.click(addAnotherListItem);
  await waitFor(() => {});

  fireEvent.click(addAnotherList);
  await waitFor(() => {});

  const [list1] = screen.getAllByTestId('delete-icon');
  const [listItem1] = screen.getAllByTestId('cross-icon');

  expect(list1).toBeInTheDocument();
  expect(listItem1).toBeInTheDocument();

  fireEvent.click(list1);
  await waitFor(() => {});

  fireEvent.click(listItem1);
  await waitFor(() => {});
});

const quickReplyInputFields = [{ value: 'yes' }, { value: 'no' }];

test('it render interactive options for quick reply template', async () => {
  props.inputFields = quickReplyInputFields;
  props.form.values.templateButtons = quickReplyInputFields;
  props.templateType = templateType[1];

  render(
    <Formik initialValues={{ templateButtons: props.inputFields }} onSubmit={mock}>
      <InteractiveOptions {...props} />
    </Formik>
  );

  const textboxes = screen.getAllByRole('textbox');
  const inputData = ['Excited', 'Very Excited'];
  let count = 0;

  for await (let input of textboxes) {
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: inputData[count] } });
    await waitFor(() => {});
    count++;
  }

  const [addButton] = screen.getAllByRole('button');
  expect(addButton).toBeInTheDocument();

  fireEvent.click(addButton);
  await waitFor(() => {});

  const [deleteFirstItem] = screen.getAllByTestId('cross-icon');
  expect(deleteFirstItem).toBeInTheDocument();

  fireEvent.click(deleteFirstItem);
  await waitFor(() => {});
});

test('it render interactive options with disabled buttons', async () => {
  props.inputFields = quickReplyInputFields;
  props.form.values.templateButtons = quickReplyInputFields;
  props.templateType = templateType[1];
  props.disabled = true;

  render(
    <Formik initialValues={{ templateButtons: props.inputFields }} onSubmit={mock}>
      <InteractiveOptions {...props} />
    </Formik>
  );
});
