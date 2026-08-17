import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing/react';
import * as Notification from 'common/notification';
import { FlowTranslation } from './FlowTranslation';
import {
  exportFlowTranslationsMock,
  exportFlowTranslationsWithErrors,
  getFlowTranslations,
  getFlowTranslationsNetworkError,
  getFlowTranslationsWithErrors,
  importFlowTranslationsMock,
  importFlowTranslationsUnsuccessfulMock,
} from 'mocks/Flow';

// The real ImportButton drives the mutation off a FileReader completion event, which
// doesn't reliably fire through userEvent.upload() in jsdom. Mock it so the import tests
// exercise FlowTranslation's own success/error handling instead of file-reading plumbing.
vi.mock('components/UI/ImportButton/ImportButton', () => ({
  ImportButton: ({ onImport, afterImport }: any) => (
    <button
      data-testid="mock-import-button"
      onClick={() => {
        onImport?.();
        afterImport(
          'Type,UUID,en,hi\nType,UUID,English,Hindi\naction,6e3ce9b0-f4a0-4a9d-a182-02647cdbcc80,No worries. You can always change that by sending us *help*.,चिंता न करें। आप हमेशा मदद मेनू में जाकर उसे बदल सकते हैं। आप अभी भी हमें कभी भी मैसेज कर सकते हैं।\naction,852fc451-7482-4c09-b3c6-55cad8546b6b,Thank you for giving us the permission. We really appreciate it.,हमें अनुमति देने के लिए धन्यवाद। हम वास्तव में इसकी बहुत सराहना करते हैं।\n'
        );
      }}
    >
      Mock Import
    </button>
  ),
}));

const defaultmocks = [getFlowTranslations];

const mockSetDialog = vi.fn();
const flowTranslation = (mocks: any = defaultmocks) => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FlowTranslation loadFlowEditor={vi.fn()} flowId="1" setDialog={mockSetDialog} />
    </MockedProvider>
  );
};

describe('Testing Translation flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render <FlowTranslation>', async () => {
    const wrapper = render(flowTranslation());
    await waitFor(() => {
      expect(wrapper.container).toBeInTheDocument();
    });
  });

  it('should autotranslate', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { getByText } = render(flowTranslation());

    const button = getByText('Submit');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Flow has been translated successfully');
    });
  });

  it('gets an error while inline translations', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { getByText } = render(flowTranslation([getFlowTranslationsWithErrors]));

    const button = getByText('Submit');
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Sorry! Unable to translate flow', 'warning');
    });
  });

  it('shows an error dialog when auto translation fails with a network error', async () => {
    const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');
    const { getByText } = render(flowTranslation([getFlowTranslationsNetworkError]));

    const button = getByText('Submit');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(mockSetDialog).toHaveBeenCalledWith(false);
      expect(errorMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network error: Failed to translate flow',
          graphQLErrors: [],
          networkError: expect.objectContaining({ message: 'Network error: Failed to translate flow' }),
        })
      );
    });
  });

  it('exports flow translations', async () => {
    const { getByText } = render(flowTranslation([exportFlowTranslationsMock(false)]));

    fireEvent.click(getByText('Export translations'));
    const submitButton = getByText('Submit');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockSetDialog).toHaveBeenCalledWith(false);
    });
  });

  it('exports flow with auto translations', async () => {
    const { getByText } = render(flowTranslation([exportFlowTranslationsMock(true)]));

    fireEvent.click(getByText('Export with auto translate'));
    const submitButton = getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(mockSetDialog).toHaveBeenCalledWith(false);
    });
  });

  it('exports flow translations with errors', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { getByText } = render(flowTranslation([exportFlowTranslationsWithErrors]));

    fireEvent.click(getByText('Export translations'));
    const submitButton = getByText('Submit');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockSetDialog).toHaveBeenCalledWith(false);
      expect(notificationSpy).toHaveBeenCalledWith('An error occured while exporting flow translations', 'warning');
    });
  });

  it('imports a translated flow', async () => {
    const mockLoadFlowEditor = vi.fn();
    const { getByText, getByTestId } = render(
      <MockedProvider mocks={[importFlowTranslationsMock]} addTypename={false}>
        <FlowTranslation loadFlowEditor={mockLoadFlowEditor} flowId="1" setDialog={mockSetDialog} />
      </MockedProvider>
    );

    fireEvent.click(getByText('Import translations'));
    fireEvent.click(getByTestId('mock-import-button'));

    await waitFor(() => {
      expect(mockSetDialog).toHaveBeenCalledWith(false);
      expect(mockLoadFlowEditor).toHaveBeenCalled();
    });
  });

  it('shows a warning and keeps the dialog open when the import responds unsuccessfully', async () => {
    const mockLoadFlowEditor = vi.fn();
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { getByText, getByTestId } = render(
      <MockedProvider mocks={[importFlowTranslationsUnsuccessfulMock]} addTypename={false}>
        <FlowTranslation loadFlowEditor={mockLoadFlowEditor} flowId="1" setDialog={mockSetDialog} />
      </MockedProvider>
    );

    fireEvent.click(getByText('Import translations'));
    fireEvent.click(getByTestId('mock-import-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('An error occured while importing flow translations', 'warning');
    });
    expect(mockSetDialog).not.toHaveBeenCalledWith(false);
    expect(mockLoadFlowEditor).not.toHaveBeenCalled();
  });

  it('stops the importing state when the import mutation fails', async () => {
    const mockLoadFlowEditor = vi.fn();
    const importError = {
      request: importFlowTranslationsMock.request,
      error: new Error('Failed to import translations'),
    };
    const { getByText, getByTestId, queryByText } = render(
      <MockedProvider mocks={[importError]} addTypename={false}>
        <FlowTranslation loadFlowEditor={mockLoadFlowEditor} flowId="1" setDialog={mockSetDialog} />
      </MockedProvider>
    );

    fireEvent.click(getByText('Import translations'));
    fireEvent.click(getByTestId('mock-import-button'));

    await waitFor(() => {
      expect(queryByText('Uploading...')).not.toBeInTheDocument();
      expect(mockLoadFlowEditor).not.toHaveBeenCalled();
    });
  });
  it('it closes the warning dialog box', async () => {
    const { getByText, container } = render(flowTranslation());
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    const button = getByText('Submit');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'esc' });
  });

  it('closes the translation dialog box', async () => {
    const wrapper = render(flowTranslation());
    await waitFor(() => {
      expect(wrapper.container).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'esc' });
  });
});
