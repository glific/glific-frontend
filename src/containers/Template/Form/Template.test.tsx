import { render, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import * as FormLayout from 'containers/Form/FormLayout';
import Template from './Template';
import { TEMPLATE_MOCKS } from '../Template.test.helper';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;

const defaultProps = {
  match: { params: { id: 1 } },
  listItemName: 'HSM Template',
  redirectionLink: 'template',
  defaultAttribute: { isHSM: true },
  icon: null,
};

test('HSM form is loaded correctly in edit mode', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Template {...defaultProps} />
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Edit HSM Template')).toBeInTheDocument();
  });
});

test('save media in template', async () => {
  const spy = jest.spyOn(FormLayout, 'FormLayout');
  spy.mockImplementation((props: any) => {
    const { getMediaId } = props;
    return (
      <div
        onClick={() => {
          getMediaId({ body: 'hey', attachmentURL: 'https://glific.com' });
        }}
        data-testid="getMedia"
      ></div>
    );
  });
  const { getByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Template {...defaultProps} />
    </MockedProvider>
  );

  fireEvent.click(getByTestId('getMedia'));

  await waitFor(() => {});
});
