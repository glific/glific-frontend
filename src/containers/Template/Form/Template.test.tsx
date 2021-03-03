import React from 'react';
import { render, waitFor, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

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
