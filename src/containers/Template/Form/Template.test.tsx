import 'mocks/matchMediaMock';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import * as FormLayout from 'containers/Form/FormLayout';
import Template from './Template';
import { TEMPLATE_MOCKS } from '../Template.test.helper';

beforeEach(() => {
  vi.restoreAllMocks();
});
const defaultMocks = [...TEMPLATE_MOCKS, ...TEMPLATE_MOCKS];

const defaultProps = {
  listItemName: 'Speed sends',
  redirectionLink: 'speed-send',
  defaultAttribute: { isHsm: false },
  icon: null,
};

const templateEdit = (props: any = defaultProps, mocks: any = defaultMocks) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/templates/1/edit']}>
      <Routes>
        <Route path="/templates/:id/edit" element={<Template {...props} />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

describe('speed sends', () => {
  test('Template form is loaded correctly in edit mode', async () => {
    const { getByText } = render(templateEdit());
    await waitFor(() => {
      expect(getByText('Edit Speed sends')).toBeInTheDocument();
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
    const { getByTestId } = render(templateEdit());
    await waitFor(() => {
      fireEvent.click(getByTestId('getMedia'));
    });
  });
});
