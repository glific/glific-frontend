import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import {
  exportInteractiveTemplateMock,
  exportInteractiveTemplateMockWithoutTranslation,
  importInteractiveTemplateMock,
  importInteractiveTemplateWithTrimmingMock,
  translateInteractiveTemplateMock,
} from 'mocks/InteractiveMessage';
import { TranslateButton } from './TranslateButton';
import * as Notification from 'common/notification';

const setStatesMock = vi.fn();
const onSumbitMock = vi.fn();

const defaultProps = {
  onSubmit: onSumbitMock,
  form: { errors: {}, setTouched: vi.fn() },
  setStates: setStatesMock,
  templateId: '1',
  setSaveClicked: vi.fn(),
  saveClicked: false,
};

const wrapper = (props?: any, mocks: any = []) => (
  <MockedProvider
    mocks={[
      translateInteractiveTemplateMock(),
      exportInteractiveTemplateMock(),
      exportInteractiveTemplateMockWithoutTranslation(),
      ...mocks,
    ]}
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

test('it exports the translation with translations', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  render(wrapper({ saveClicked: false }));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Export with translations'));

  fireEvent.click(screen.getByText('Continue'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it exports the translation without translations', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  render(wrapper({ saveClicked: false }));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Export without translations'));

  fireEvent.click(screen.getByText('Continue'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it imports the template', async () => {
  render(wrapper({ saveClicked: false }, [importInteractiveTemplateMock()]));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Import translations'));

  const file = new File(['content'], 'template.csv', { type: 'text/csv' });
  const input = screen.getByTestId('import');
  fireEvent.change(input, { target: { files: [file] } });
});

const containerForErrorStates = (
  <MockedProvider
    mocks={[
      translateInteractiveTemplateMock(true),
      importInteractiveTemplateMock(true),
      exportInteractiveTemplateMock(true),
      exportInteractiveTemplateMockWithoutTranslation(true),
    ]}
    addTypename={false}
  >
    <TranslateButton {...defaultProps} saveClicked={false} />
  </MockedProvider>
);

test('should throw error for failed translations', async () => {
  const errormessagespy = vi.spyOn(Notification, 'setErrorMessage');
  render(containerForErrorStates);

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Export without translations'));

  fireEvent.click(screen.getByText('Continue'));

  await waitFor(() => {
    expect(errormessagespy).toHaveBeenCalled();
  });
});

test('should throw error for failed import', async () => {
  const errormessagespy = vi.spyOn(Notification, 'setErrorMessage');
  render(containerForErrorStates);
  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Import translations'));

  const file = new File(['content'], 'template.csv', { type: 'text/csv' });
  const input = screen.getByTestId('import');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(errormessagespy).toHaveBeenCalled();
  });
});

test('it should show warning if message exceeds limit', async () => {
  render(wrapper({ saveClicked: false }, [importInteractiveTemplateWithTrimmingMock]));

  fireEvent.click(screen.getByText('Translate'));

  await waitFor(() => {
    expect(screen.getByText('Translate Options')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Import translations'));

  const file = new File(['content'], 'template.csv', { type: 'text/csv' });
  const input = screen.getByTestId('import');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText('Translations exceeding limit.')).toBeInTheDocument();
  });
});
