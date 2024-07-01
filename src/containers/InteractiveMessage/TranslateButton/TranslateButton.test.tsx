import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { TranslateButton } from './TranslateButton';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import {
  importInteractiveTemplateMock,
  translateInteractiveTemplateMock,
} from 'mocks/InteractiveMessage';

const setStatesMock = vi.fn();
const onSumbitMock = vi.fn();

const defaultProps = {
  onSubmit: onSumbitMock,
  setStates: setStatesMock,
  errors: {},
  templateId: '1',
  setSaveClicked: vi.fn(),
};

const wrapper = (props?: any) => (
  <MockedProvider
    mocks={[translateInteractiveTemplateMock, importInteractiveTemplateMock]}
    addTypename={false}
  >
    <TranslateButton {...props} {...defaultProps} />
  </MockedProvider>
);

test('it opens and closes dialog box', async () => {
  render(wrapper({ saveClicked: false }));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Cancel'));
});

test('it changes the translate option', async () => {
  render(wrapper({ saveClicked: false }));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Export Interactive Template With Translations'));

  fireEvent.click(screen.getByText('Continue'));

  fireEvent.click(screen.getByText('Export Interactive Template Without Translations'));

  fireEvent.click(screen.getByText('Continue'));
});

test('it translates the template', async () => {
  render(wrapper({ saveClicked: true }));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(setStatesMock).toHaveBeenCalled();
  });
});

test('it imports the template', async () => {
  render(wrapper({ saveClicked: false }));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Import Interactive Template'));

  const file = new File(['content'], 'template.csv', { type: 'text/csv' });
  const input = screen.getByTestId('import');
  fireEvent.change(input, { target: { files: [file] } });
});
