import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { AddAutoComplete } from './AddAutoComplete';
import { CREATE_LABEL } from 'graphql/mutations/Tags';
describe('<AddAutoComplete />', () => {
  const mocks = [
    {
      request: {
        query: CREATE_LABEL,
      },
      result: {
        data: {
          createTag: {
            tag: {
              description: null,
              id: '1',
              label: 'Messages',
            },
          },
        },
      },
    },
  ];
  const option: any[] = [
    {
      description: null,
      id: '1',
      label: 'Messages',
    },
  ];

  const mockHandleChange = vi.fn();
  const defaultProps = {
    label: 'Example',
    options: option,
    optionLabel: 'label',
    onChange: mockHandleChange,
    field: { name: 'example', value: [] },
    form: { dirty: false, touched: false, errors: false, setFieldValue: mockHandleChange },
  };

  it('renders <AddAutoComplete /> component', () => {
    const container = render(
      <MockedProvider mocks={mocks}>
        <AddAutoComplete {...defaultProps} />
      </MockedProvider>
    );
    waitFor(() => {
      expect(container).toBeTruthy();
      expect(container.getByText('Messages')).toBeInTheDocument();
    });
  });
});
