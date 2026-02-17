import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import Configure from './Configure';

import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';

let capturedOnDragEnd: ((event: any) => void) | null = null;

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    },
  };
});

const wrapper = (id: number = 1) => {
  const mocks = WHATSAPP_FORM_MOCKS;

  return (
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={[`/whatsapp-forms/${id}/configure`]}>
        <Routes>
          <Route path="/whatsapp-forms" element={<div>WhatsApp Forms</div>} />
          <Route path="/whatsapp-forms/:id/configure" element={<Configure />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe('<Configure />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the form correctly', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });
  });

  test('it adds and deletes screen and saves the form', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    expect(screen.getByTestId('add-screen')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('add-screen'));

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(2);
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Screen 2');
    });

    // test screen toggle
    fireEvent.click(screen.getAllByTestId('toggle-screen-expand')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Screen 1');
    });

    // deletes the screen
    fireEvent.click(screen.getAllByTestId('delete-screen')[1]);

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByText('Saving')).toBeInTheDocument();
    });
  });

  test('it updates the screen name and button label which should be saved ', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.change(screen.getByTestId('screen-name-input'), { target: { value: 'New Screen Name' } });

    await waitFor(() => {
      expect(screen.getByTestId('preview-screen-name')).toHaveTextContent('New Screen Name');
    });

    fireEvent.change(screen.getByTestId('button-label-input'), { target: { value: 'Next' } });

    await waitFor(() => {
      expect(screen.getByTestId('preview-button-label')).toHaveTextContent('Next');
    });
  });

  test('it adds Text Heading content to the screen and generates JSON', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    // large heading
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text'));

    fireEvent.click(screen.getAllByText('Large Heading')[1]);

    await waitFor(() => {
      expect(screen.getByTestId('text-content')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('text-content-input'), { target: { value: 'Large Heading' } });

    // small heading
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text'));

    fireEvent.click(screen.getByText('Small Heading'));

    await waitFor(() => {
      expect(screen.getByTestId('text-content')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('text-content-input'), { target: { value: 'Small Heading' } });

    // caption
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text'));

    fireEvent.click(screen.getByText('Caption'));

    await waitFor(() => {
      expect(screen.getByTestId('text-content')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('text-content-input'), { target: { value: 'Caption' } });

    fireEvent.click(screen.getAllByTestId('content-toggle-expand')[1]);

    // body
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text'));

    fireEvent.click(screen.getByText('Body'));

    await waitFor(() => {
      expect(screen.getByTestId('text-content')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('text-content-input'), { target: { value: 'Body' } });

    await waitFor(() => {
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Large Heading');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Small Heading');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Caption');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Body');
    });

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });
  });

  test('it adds Text Answer content to the screen and generates JSON', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    // short answer
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text Answer'));

    fireEvent.click(screen.getAllByText('Short Answer')[1]);

    await waitFor(() => {
      expect(screen.getByTestId('text-answer-content')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Short Answer Label' } });

    // paragraph
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text Answer'));

    fireEvent.click(screen.getByText('Paragraph'));

    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Paragraph Label' } });

    // date picker
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text Answer'));

    fireEvent.click(screen.getByText('Date Picker'));
    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Date Picker Label' } });

    await waitFor(() => {
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Short Answer Label');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Paragraph Label');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Date Picker Label');
    });

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });
  });

  test('it adds Selection content to the screen and generates JSON', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    // single choice
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Selection'));

    fireEvent.click(screen.getByText('Single Choice'));

    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Single Choice Label' } });

    fireEvent.change(screen.getAllByTestId('option-input')[0], { target: { value: 'Opt-1' } });
    fireEvent.change(screen.getAllByTestId('option-input')[1], { target: { value: 'Opt-2' } });

    fireEvent.click(screen.getByTestId('add-option-button'));

    fireEvent.change(screen.getAllByTestId('option-input')[2], { target: { value: 'Opt-3' } });

    //test deleting the option
    fireEvent.click(screen.getAllByTestId('delete-option-button')[2]);

    await waitFor(() => {
      expect(screen.queryAllByTestId('option-input')).toHaveLength(2);
    });

    //multiple choice
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Selection'));

    fireEvent.click(screen.getByText('Multiple Choice'));

    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Multiple Choice Label' } });

    fireEvent.change(screen.getAllByTestId('option-input')[0], { target: { value: 'Opt-A' } });
    fireEvent.change(screen.getAllByTestId('option-input')[1], { target: { value: 'Opt-B' } });

    // dropdown
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Selection'));

    fireEvent.click(screen.getByText('Dropdown'));
    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Dropdown Label' } });

    fireEvent.change(screen.getAllByTestId('option-input')[0], { target: { value: 'Opt-X' } });
    fireEvent.change(screen.getAllByTestId('option-input')[1], { target: { value: 'Opt-Y' } });

    // opt-in
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Selection'));

    fireEvent.click(screen.getByText('Opt In'));
    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Opt In Label' } });

    await waitFor(() => {
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Single Choice Label');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Multiple Choice Label');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Dropdown Label');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Opt In Label');
    });

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });
  });

  test('it uploads an image file successfully and generates JSON', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Media'));
    fireEvent.click(screen.getByText('Image'));

    await waitFor(() => {
      expect(screen.getByTestId('media-content')).toBeInTheDocument();
    });

    const file = new File(['fake-image-content'], 'test-image.png', { type: 'image/png' });

    const fileInput = screen.getByTestId('uploadFile');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });
  });

  test('it shows error for invalid file type', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Media'));
    fireEvent.click(screen.getByText('Image'));

    await waitFor(() => {
      expect(screen.getByTestId('media-content')).toBeInTheDocument();
    });

    const file = new File(['fake-image-content'], 'test-image.pdf', { type: 'application/pdf' });

    const fileInput = screen.getByTestId('uploadFile');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Please select a valid image file (JPEG, PNG)')).toBeInTheDocument();
    });
  });

  test('it shows error for file size exceeding 300KB', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Media'));
    fireEvent.click(screen.getByText('Image'));

    await waitFor(() => {
      expect(screen.getByTestId('media-content')).toBeInTheDocument();
    });

    const file = new File(['fake-image-content'], 'test-image.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 400 * 1024 });

    const fileInput = screen.getByTestId('uploadFile');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 300KB/)).toBeInTheDocument();
    });
  });

  test('it removes uploaded image when Remove button is clicked', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Media'));
    fireEvent.click(screen.getByText('Image'));

    await waitFor(() => {
      expect(screen.getByTestId('media-content')).toBeInTheDocument();
    });

    const file = new File(['fake-image-content'], 'test-image.png', { type: 'image/png' });

    const fileInput = screen.getByTestId('uploadFile');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText('Uploaded media')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.getByText('Drag and drop files')).toBeInTheDocument();
      expect(screen.queryByAltText('Uploaded media')).not.toBeInTheDocument();
    });
  });

  test('it deletes a content item from the screen', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('content-item')).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByTestId('delete-content')[0]);

    await waitFor(() => {
      expect(screen.getAllByTestId('content-item')).toHaveLength(1);
    });
  });

  test('it shows correct validations', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    // screen name validation
    fireEvent.change(screen.getByTestId('screen-name-input'), { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('Screen name is required')).toBeInTheDocument();
    });

    // form field validations
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text Answer'));

    fireEvent.click(screen.getByText('Paragraph'));

    fireEvent.change(screen.getByTestId('label-input'), { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('Label is required')).toBeInTheDocument();
    });
  });

  test('it reorders screens by dragging', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('add-screen'));

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(2);
    });

    const getContentItemNames = () => {
      return screen.getAllByTestId('form-screen').map((item) => {
        const title = item.querySelector('[class*="ContentTitle"]');
        return title?.textContent || '';
      });
    };

    const initialOrder = getContentItemNames();
    expect(initialOrder).toHaveLength(2);

    expect(capturedOnDragEnd).not.toBeNull();

    act(() => {
      capturedOnDragEnd!({
        active: { id: 'screen_0_Text_0' },
        over: { id: 'screen_0_Label_0' },
      });
    });

    await waitFor(() => {
      const newOrder = getContentItemNames();
      expect(newOrder[0]).toBe(initialOrder[1]);
      expect(newOrder[1]).toBe(initialOrder[0]);
    });
  });

  test('it reorders content items by dragging', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('content-item')).toHaveLength(2);
    });

    const getContentItemNames = () => {
      return screen.getAllByTestId('content-item').map((item) => {
        const title = item.querySelector('[class*="ContentTitle"]');
        return title?.textContent || '';
      });
    };

    const getContentItemIds = () => {
      return screen.getAllByTestId('content-item').map((item) => item.getAttribute('data-item-id'));
    };

    const initialOrder = getContentItemNames();
    const itemIds = getContentItemIds();

    expect(initialOrder).toHaveLength(2);
    expect(itemIds[0]).not.toBeNull();
    expect(itemIds[1]).not.toBeNull();

    expect(capturedOnDragEnd).not.toBeNull();

    act(() => {
      capturedOnDragEnd!({
        active: { id: itemIds[0] },
        over: { id: itemIds[1] },
      });
    });

    await waitFor(() => {
      const newOrder = getContentItemNames();
      expect(newOrder[0]).toBe(initialOrder[1]);
      expect(newOrder[1]).toBe(initialOrder[0]);
    });
  });

  test('published form shows view mode', async () => {
    render(wrapper(2));

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('add-screen')).not.toBeInTheDocument();
    });
  });

  test('it shows the new definition when a version is clicked', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByText('Revision History'));

    await waitFor(() => {
      expect(screen.getByTestId('version-history')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Version 3'));

    await waitFor(() => {
      expect(screen.getByText('Back to Editing')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Editing'));
  });

  test('it reverts to a previous form version', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByText('Revision History'));

    await waitFor(() => {
      expect(screen.getByTestId('version-history')).toBeInTheDocument();
    });

    expect(screen.getByText('Current')).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId('revert-version-button')[4]);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to revert?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Successfully reverted to selected version', 'success');
    });
  });

  test('it should rename the variables', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByText('Field Names'));

    fireEvent.click(screen.getAllByTestId('edit-icon')[0]);

    fireEvent.change(screen.getByTestId('variable-name-input'), { target: { value: 'new_variable_name' } });

    fireEvent.click(screen.getAllByTestId('save-icon')[0]);

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByTestId('json-preview')).toHaveTextContent('new_variable_name');
    });
  });

  test('form with errors shows notification on publish attempt', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.change(screen.getByTestId('screen-name-input'), { target: { value: '' } });

    fireEvent.click(screen.getByText('Submit to Meta'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Please fix the errors in the form before publishing.', 'warning');
    });
  });

  test("it should copy the json to clipboard when 'Copy to Clipboard' is clicked", async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });

    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    fireEvent.click(screen.getByText('Copy JSON'));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  test("it should publish the form when 'Publish' is clicked", async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');

    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByText('Submit to Meta'));

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    fireEvent.click(screen.getByText('Submit to Meta'));

    await waitFor(() => {
      expect(screen.getByText('Publish Form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Form published successfully', 'success');
    });
  });

  test("should navigate back to whatsapp forms list when 'Back' is clicked", async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('back-button'));

    await waitFor(() => {
      expect(screen.getByText('WhatsApp Forms')).toBeInTheDocument();
    });
  });

  test('makes changes to whatsapp form json and saves', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });

    const jsonTextarea = screen.getByTestId('json-preview') as HTMLTextAreaElement;

    fireEvent.change(jsonTextarea, {
      target: { value: jsonTextarea.value.replace(/Screen 1/g, 'Updated Screen Name') },
    });

    await waitFor(() => {
      expect(screen.getByText('Apply Changes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apply Changes'));

    await waitFor(() => {
      expect(screen.getByTestId('preview-screen-name')).toHaveTextContent('Updated Screen Name');
    });
  });

  test('it shows errors in json', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getAllByTestId('form-screen')).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId('formJsonBtn'));

    await waitFor(() => {
      expect(screen.getByText('Form JSON')).toBeInTheDocument();
    });

    const jsonTextarea = screen.getByTestId('json-preview') as HTMLTextAreaElement;

    fireEvent.change(jsonTextarea, {
      target: { value: jsonTextarea.value.replace(/"Label"/g, '""') },
    });

    await waitFor(() => {
      expect(screen.getByTestId('json-error')).toHaveTextContent(
        'Form has validation errors (missing required fields)'
      );
    });

    fireEvent.change(jsonTextarea, {
      target: { value: '' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('json-error')).toHaveTextContent('JSON cannot be empty');
    });

    fireEvent.change(jsonTextarea, {
      target: { value: '{ ' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('json-error')).toHaveTextContent(/Expected property name or '}' in JSON at position 2/);
    });

    fireEvent.change(jsonTextarea, {
      target: { value: '{ }' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('json-error')).toHaveTextContent('Missing or invalid "screens" array');
    });

    fireEvent.change(jsonTextarea, {
      target: { value: '{ "screens": [] }' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('json-error')).toHaveTextContent('Screens array cannot be empty');
    });
  });
});
