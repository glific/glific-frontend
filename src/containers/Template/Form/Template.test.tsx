import 'mocks/matchMediaMock';
import { render, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import * as FormLayout from 'containers/Form/FormLayout';
import Template from './Template';
import { TEMPLATE_MOCKS } from '../Template.test.helper';

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: '1' }),
  };
});

afterEach(cleanup);
const mocks = [...TEMPLATE_MOCKS, ...TEMPLATE_MOCKS];

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
      <BrowserRouter>
        <Template {...defaultProps} />
      </BrowserRouter>
    </MockedProvider>
  );
  await waitFor(() => {
    expect(getByText('Edit HSM Template')).toBeInTheDocument();
  });
});

test('save media in template', async () => {
  const spy = vi.spyOn(FormLayout, 'FormLayout');
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
      <BrowserRouter>
        <Template {...defaultProps} />
      </BrowserRouter>
    </MockedProvider>
  );
  await waitFor(() => {
    fireEvent.click(getByTestId('getMedia'));
  });
});
