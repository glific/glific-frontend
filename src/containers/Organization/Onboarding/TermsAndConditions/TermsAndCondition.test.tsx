import { fireEvent, render, waitFor } from '@testing-library/react';
import { TermsAndConditions } from './TermsAndCondition';

const props = {
  openReachOutToUs: vi.fn(),
  field: {
    name: 'permissions',
    value: {
      terms_agreed: false,
      support_staff_account: true,
    },
  },
  form: { setFieldValue: vi.fn(), touched: {}, errors: {} },
};

const container = <TermsAndConditions {...props} />;

test('it opens the dialog box and clicks on I agree', async () => {
  const { getByText, getAllByRole } = render(container);

  expect(getByText('Glific Terms & conditions')).toBeInTheDocument();

  const checkboxes = getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]);

  await waitFor(() => {
    expect(getByText('Terms and conditions')).toBeInTheDocument();
  });

  fireEvent.click(getByText('I Agree'));

  // checks the false condition of the checkbox
  fireEvent.click(checkboxes[0]);
});

test('it clicks on I disagree', async () => {
  const { getByText, getAllByRole } = render(container);

  expect(getByText('Glific Terms & conditions')).toBeInTheDocument();

  const checkboxes = getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]);

  fireEvent.click(getByText('I Disagree'));
});

test('it toggles the support staff checkbox', async () => {
  const { getByText, getAllByRole } = render(container);

  expect(getByText('Glific Terms & conditions')).toBeInTheDocument();

  const checkboxes = getAllByRole('checkbox');
  fireEvent.click(checkboxes[1]);
});
