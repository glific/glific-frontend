import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';

import { ListReplyTemplate } from './ListReplyTemplate';

const inputFields = [
  { title: '', options: [{ title: '', description: '' }] },
  { title: '', options: [{ title: '', description: '' }] },
];
const props: any = {
  index: 0,
  inputFields,
  form: {
    touched: {},
    errors: {},
    values: {
      templateButtons: inputFields,
    },
  },
  onListAddClick: vi.fn(),
  onListRemoveClick: vi.fn(),
  onListItemAddClick: vi.fn(),
  onListItemRemoveClick: vi.fn(),
  onInputChange: vi.fn(),
};
const mock = vi.fn();

test('it renders the template', async () => {
  render(
    <Formik initialValues={{ templateButtons: inputFields }} onSubmit={mock}>
      <ListReplyTemplate {...props} />
    </Formik>
  );

  const [section, title, description] = screen.getAllByRole('textbox');
  expect(section).toBeInTheDocument();
  expect(title).toBeInTheDocument();
  expect(description).toBeInTheDocument();

  fireEvent.change(section, { target: { value: 'section 1' } });
  fireEvent.change(title, { target: { value: 'title 1' } });
  fireEvent.change(description, { target: { value: 'description 1' } });
  fireEvent.blur(section);
  fireEvent.blur(title);
  fireEvent.blur(description);

  const deleteItem = screen.getByText('Red.svg');
  expect(deleteItem).toBeInTheDocument();

  fireEvent.click(deleteItem);
  await waitFor(() => {});
});

const errorForm = {
  touched: { templateButtons: inputFields },
  values: { templateButtons: inputFields },
  errors: {
    templateButtons: [
      { title: 'Required', options: [{ title: 'Required', description: 'Required' }] },
      { title: 'Required', options: [{ title: 'Required', description: 'Required' }] },
    ],
  },
};

test('it renders the template with errors', async () => {
  props.form = errorForm;
  render(
    <Formik initialValues={{ templateButtons: inputFields }} onSubmit={mock}>
      <ListReplyTemplate {...props} />
    </Formik>
  );
});

test('it renders template and perform actions', async () => {
  props.index = 1;
  render(
    <Formik initialValues={{ templateButtons: inputFields }} onSubmit={mock}>
      <ListReplyTemplate {...props} />
    </Formik>
  );

  const [buttonToAddList, buttonToAddListItem] = screen.getAllByRole('button');

  expect(buttonToAddList).toBeInTheDocument();

  fireEvent.click(buttonToAddList);
  await waitFor(() => {});

  expect(buttonToAddListItem).toBeInTheDocument();

  fireEvent.click(buttonToAddListItem);
  await waitFor(() => {});

  const deleteList = screen.getByText('Red.svg');
  expect(deleteList).toBeInTheDocument();

  fireEvent.click(deleteList);
  await waitFor(() => {});
});
