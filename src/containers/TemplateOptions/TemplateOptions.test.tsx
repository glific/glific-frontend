import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { TemplateOptions } from './TemplateOptions';

const props = (isAddButtonChecked: any, templateType: any, inputFields: any, form: any) => ({
  onAddClick: jest.fn(),
  onRemoveClick: jest.fn(),
  onInputChange: jest.fn(),
  onTemplateTypeChange: jest.fn(),
  isAddButtonChecked,
  templateType,
  inputFields,
  form,
});

const callToAction = { type: 'phone_number', value: '', title: '' };
const quickReply = { value: '' };

const form: any = {
  values: { templateButtons: [] },
  touched: {},
  errors: {},
};

test('it renders component and selects call to action type', async () => {
  const inputFields = [callToAction];
  form.values.templateButtons.push(callToAction);
  const defaultProps = props(true, null, inputFields, form);

  render(<TemplateOptions {...defaultProps} />);

  const callToActionButton = screen.getByText('Call to actions');
  fireEvent.click(callToActionButton);
  await waitFor(() => {});
});

test('it renders call to action button template successfully', async () => {
  const inputFields = [callToAction];
  form.values.templateButtons.push(callToAction);
  const defaultProps = props(true, 'CALL_TO_ACTION', inputFields, form);
  render(
    <Formik initialValues={inputFields} onSubmit={() => jest.fn()}>
      <TemplateOptions {...defaultProps} />
    </Formik>
  );

  const callToActionButton = screen.getAllByRole('radio');
  fireEvent.change(callToActionButton[2], { target: { value: 'phone_number' } });
  await waitFor(() => {});

  const [value, title] = screen.getAllByRole('textbox');

  fireEvent.change(title, { target: { value: 'Contact Us' } });
  fireEvent.blur(title);
  await waitFor(() => {});

  fireEvent.change(value, { target: { value: '+919090909090' } });
  fireEvent.blur(value);
  await waitFor(() => {});
});

test('it renders quick reply button template successfully', async () => {
  const inputFields = [quickReply, quickReply];
  form.values.templateButtons.push(quickReply);
  form.values.templateButtons.push(quickReply);
  const defaultProps = props(true, 'QUICK_REPLY', inputFields, form);
  render(
    <Formik initialValues={inputFields} onSubmit={() => jest.fn()}>
      <TemplateOptions {...defaultProps} />
    </Formik>
  );

  const [value] = screen.getAllByRole('textbox');
  fireEvent.change(value, { target: { value: 'Yes' } });
  fireEvent.blur(value);
  await waitFor(() => {});

  const deleteButtons = screen.getAllByText('Red.svg');
  fireEvent.click(deleteButtons[1]);
  await waitFor(() => {});

  const addButton = screen.getByText('Add Quick Reply');
  fireEvent.click(addButton);
  await waitFor(() => {});
});
