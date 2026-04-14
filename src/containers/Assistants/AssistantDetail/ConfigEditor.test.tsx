import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import * as Notification from 'common/notification';
import {
  CONFIG_EDITOR_SAVE_MOCKS,
  createAssistantConfigMock,
  createAssistantErrorMock,
  mockVersions,
  setLiveVersionErrorMock,
  updateAssistantErrorMock,
} from 'mocks/Assistants';

import { ConfigEditor } from './ConfigEditor';

const notificationSpy = vi.spyOn(Notification, 'setNotification');

const mockVersion = mockVersions[0];

const defaultEditProps = {
  assistantId: '1',
  assistantName: 'Test Assistant',
  version: mockVersion,
  vectorStore: {
    id: 'vs-1',
    vectorStoreId: 'vs_abc123',
    knowledgeBaseVersionId: 'llm-vs-1',
    name: 'VectorStore-1',
    legacy: false,
    files: [],
  },
  newVersionInProgress: false,
  onSaved: vi.fn(),
  onUnsavedChange: vi.fn(),
};

const defaultCreateProps = {
  assistantId: '',
  assistantName: '',
  version: undefined,
  vectorStore: null,
  newVersionInProgress: false,
  onSaved: vi.fn(),
  onCancel: vi.fn(),
  createMode: true,
};

const renderEdit = (props = {}, mocks: any[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <ConfigEditor {...defaultEditProps} {...props} />
    </MockedProvider>
  );

const renderCreate = (props = {}, mocks: any[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <ConfigEditor {...defaultCreateProps} {...props} />
    </MockedProvider>
  );

describe('ConfigEditor — create mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Name field only in create mode', () => {
    renderCreate();
    const nameField = screen.getAllByRole('textbox').find((el) => el.getAttribute('name') === 'name');
    expect(nameField).toBeInTheDocument();
  });

  it('renders Instructions, Model, Temperature, Notes fields', () => {
    renderCreate();
    expect(screen.getByText(/Instructions \(Prompt\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Model/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/Notes \(Optional\)/i)).toBeInTheDocument();
  });

  it('renders Cancel and Save buttons', () => {
    renderCreate();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('does not render the header bar in create mode', () => {
    renderCreate();
    expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('setLiveButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('saveVersionButton')).not.toBeInTheDocument();
  });

  it('Cancel button calls onCancel', () => {
    const onCancel = vi.fn();
    renderCreate({ onCancel });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors when submitting empty form', async () => {
    renderCreate();
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Instructions are required')).toBeInTheDocument();
    });
  });

  it('calls createAssistant mutation and onSaved on success', async () => {
    const onSaved = vi.fn();

    renderCreate({ onSaved }, [createAssistantConfigMock]);

    const nameField = screen.getAllByRole('textbox').find((el) => el.getAttribute('name') === 'name');
    fireEvent.change(nameField!, { target: { value: 'My Assistant' } });

    const textareas = screen.getAllByRole('textbox');
    const instructionsField = textareas.find((el) => el.getAttribute('name') === 'instructions');
    fireEvent.change(instructionsField!, { target: { value: 'Test instructions' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Assistant created successfully', 'success');
    });
  });

  it('shows error notification when createAssistant returns errors', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    renderCreate({}, [createAssistantErrorMock]);

    const nameField = screen.getAllByRole('textbox').find((el) => el.getAttribute('name') === 'name');
    fireEvent.change(nameField!, { target: { value: 'My Assistant' } });

    const instructionsField = screen.getAllByRole('textbox').find((el) => el.getAttribute('name') === 'instructions');
    fireEvent.change(instructionsField!, { target: { value: 'Test instructions' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});

describe('ConfigEditor — edit mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not render Name field in edit mode', () => {
    renderEdit();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });

  it('renders header with breadcrumb showing assistant name and version number', () => {
    renderEdit();
    expect(screen.getByText('Test Assistant / Version 1')).toBeInTheDocument();
  });

  it('renders Set As LIVE and Save buttons in header', () => {
    renderEdit();
    expect(screen.getByTestId('setLiveButton')).toBeInTheDocument();
    expect(screen.getByTestId('saveVersionButton')).toBeInTheDocument();
  });

  it('populates instructions field from version data', () => {
    renderEdit();
    const textareas = screen.getAllByRole('textbox');
    const instructionsField = textareas.find((el) => el.getAttribute('name') === 'instructions');
    expect(instructionsField).toHaveValue('You are a helpful assistant.');
  });

  it('Set As LIVE button is disabled when version is already live', () => {
    renderEdit();
    expect(screen.getByTestId('setLiveButton')).toBeDisabled();
  });

  it('Set As LIVE button is enabled when version is not live', () => {
    renderEdit({ version: { ...mockVersion, isLive: false } });
    expect(screen.getByTestId('setLiveButton')).not.toBeDisabled();
  });

  it('shows unsaved indicator when instructions are changed', async () => {
    renderEdit();

    const textareas = screen.getAllByRole('textbox');
    const instructionsField = textareas.find((el) => el.getAttribute('name') === 'instructions');
    fireEvent.change(instructionsField!, { target: { value: 'New instructions' } });

    await waitFor(() => {
      expect(screen.getByTestId('unsavedIndicator')).toBeInTheDocument();
    });
  });

  it('calls onUnsavedChange with true when form is modified', async () => {
    const onUnsavedChange = vi.fn();
    renderEdit({ onUnsavedChange });

    const textareas = screen.getAllByRole('textbox');
    const instructionsField = textareas.find((el) => el.getAttribute('name') === 'instructions');
    fireEvent.change(instructionsField!, { target: { value: 'Changed' } });

    await waitFor(() => {
      expect(onUnsavedChange).toHaveBeenCalledWith(true);
    });
  });

  it('calls updateAssistant mutation and shows notification on save', async () => {
    renderEdit({}, CONFIG_EDITOR_SAVE_MOCKS);

    const textareas = screen.getAllByRole('textbox');
    const instructionsField = textareas.find((el) => el.getAttribute('name') === 'instructions');
    fireEvent.change(instructionsField!, { target: { value: 'Updated instructions' } });

    notificationSpy.mockClear();
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Changes saved successfully', 'success');
      expect(defaultEditProps.onSaved).toHaveBeenCalled();
    });
  });

  it('shows error notification when updateAssistant returns errors', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    renderEdit({}, [updateAssistantErrorMock]);

    const textareas = screen.getAllByRole('textbox');
    const instructionsField = textareas.find((el) => el.getAttribute('name') === 'instructions');
    fireEvent.change(instructionsField!, { target: { value: 'Updated instructions' } });

    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  it('shows error when setLiveVersion returns errors', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    renderEdit({ version: { ...mockVersion, id: 'v2', isLive: false } }, [setLiveVersionErrorMock]);

    fireEvent.click(screen.getByTestId('setLiveButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});

describe('ConfigEditor — settings parsing', () => {
  beforeEach(() => vi.clearAllMocks());

  it('populates temperature correctly when settings is a JSON string', () => {
    renderEdit({
      version: {
        ...mockVersion,
        settings: JSON.stringify({ temperature: 0.7 }),
      },
    });

    expect(screen.getByTestId('sliderDisplay')).toHaveValue(0.7);
  });

  it('falls back to default model (gpt-4o) when version.model is null', () => {
    renderEdit({ version: { ...mockVersion, model: null } });

    expect(screen.getByDisplayValue('gpt-4o')).toBeInTheDocument();
  });

  it('falls back to temperature 0.1 when settings is null', () => {
    renderEdit({ version: { ...mockVersion, settings: null } });

    expect(screen.getByTestId('sliderDisplay')).toHaveValue(0.1);
  });
});

describe('ConfigEditor — expand instructions modal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('expand icon opens the instructions modal', async () => {
    renderEdit();
    fireEvent.click(screen.getByTestId('expandIcon'));

    await waitFor(() => {
      expect(screen.getByText('Edit system instructions')).toBeInTheDocument();
    });
  });

  it('cancel button in modal closes it', async () => {
    renderEdit();
    fireEvent.click(screen.getByTestId('expandIcon'));

    await waitFor(() => {
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('cancel-button'));

    await waitFor(() => {
      expect(screen.queryByText('Edit system instructions')).not.toBeInTheDocument();
    });
  });

  it('save button in modal closes it', async () => {
    renderEdit();
    fireEvent.click(screen.getByTestId('expandIcon'));

    await waitFor(() => {
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.queryByText('Edit system instructions')).not.toBeInTheDocument();
    });
  });

  it('editing instructions in modal updates the form field', async () => {
    renderEdit();
    fireEvent.click(screen.getByTestId('expandIcon'));

    await waitFor(() => {
      expect(screen.getByText('Edit system instructions')).toBeInTheDocument();
    });

    const modalTextarea = screen.getAllByDisplayValue('You are a helpful assistant.')[1];
    fireEvent.change(modalTextarea, { target: { value: 'Updated via modal' } });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.queryByText('Edit system instructions')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('unsavedIndicator')).toBeInTheDocument();
  });
});
