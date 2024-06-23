import 'mocks/matchMediaMock';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import * as FormLayout from 'containers/Form/FormLayout';
import Template from './Template';
import { TEMPLATE_MOCKS } from '../Template.test.helper';
import { HSM_TEMPLATE_MOCKS, templateFormHSMFormFields } from './Template.test.helper';
import { LexicalWrapper } from 'common/LexicalWrapper';
import { LexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';

beforeEach(() => {
  vi.restoreAllMocks();
});
const defaultMocks = [...TEMPLATE_MOCKS, ...TEMPLATE_MOCKS];

const defaultProps = {
  listItemName: 'Speed sends',
  redirectionLink: 'speed-send',
  defaultAttribute: { isHsm: false },
  icon: null,
  getSimulatorMessage: vi.fn(),
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

const hsmProps = {
  listItemName: 'HSM Template',
  redirectionLink: 'template',
  defaultAttribute: {
    isHsm: true,
  },
  icon: null,
  getShortcode: '',
  category: {
    label: 'ACCOUNT_UPDATE',
    id: 'ACCOUNT_UPDATE',
  },
  languageStyle: 'dropdown',
  formField: templateFormHSMFormFields,
  setCategory: vi.fn(),
  getSimulatorMessage: vi.fn(),
};

const hsmTemplateEdit = (templateId: string) => (
  <LexicalWrapper>
    <MockedProvider mocks={HSM_TEMPLATE_MOCKS}>
      <MemoryRouter initialEntries={[`/templates/${templateId}/edit`]}>
        <Routes>
          <Route path="/templates/:id/edit" element={<Template {...hsmProps} />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  </LexicalWrapper>
);

describe('hsm templates in edit mode', () => {
  test('Template is loaded correctly in edit mode', async () => {
    const { getByText } = render(hsmTemplateEdit('1'));

    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => expect(getByText('Edit HSM Template')).toBeInTheDocument());
  });

  test('Template is loaded with correct buttons', async () => {
    const { getByText, getAllByRole } = render(hsmTemplateEdit('2'));

    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => expect(getByText('Edit HSM Template')).toBeInTheDocument());

    const radioButtons = getAllByRole('radio');

    await waitFor(() => {
      expect(radioButtons[0]).toHaveAttribute('checked', '');
    });
  });
});

const hsmTemplate = (
  <LexicalComposer
    initialConfig={{
      namespace: 'template-input',
      onError: (error: any) => console.log(error),
    }}
  >
    <MockedProvider mocks={HSM_TEMPLATE_MOCKS}>
      <MemoryRouter initialEntries={[`/template/add`]}>
        <Template {...hsmProps} />
      </MemoryRouter>
    </MockedProvider>
  </LexicalComposer>
);

describe('hsm templates create mode', () => {
  test('Template Form is loaded correctly in create mode', async () => {
    const { getByText } = render(hsmTemplate);

    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => expect(getByText('Add a new HSM Template')).toBeInTheDocument());
  });
});
