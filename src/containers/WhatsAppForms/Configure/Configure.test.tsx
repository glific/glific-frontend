import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import Configure from './Configure';

import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';

const mockNavigate = vi.fn();

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

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
    setErrorMessage: vi.fn(),
  };
});

const wrapper = (extraMocks: any[] = []) => {
  const mocks = [...WHATSAPP_FORM_MOCKS];

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={['/whatsapp-forms/1/configure']}>
        <Routes>
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

  test('it adds and deletes a new screen when Add Screen is clicked', async () => {
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

  test('it adds Text Heading content to the screen', async () => {
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
  });

  test('it adds Text Answer content to the screen', async () => {
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

    // date pixker
    fireEvent.click(screen.getByTestId('add-content-button'));
    fireEvent.mouseEnter(screen.getByTestId('Text Answer'));

    fireEvent.click(screen.getByText('Date Picker'));
    fireEvent.change(screen.getByTestId('label-input'), { target: { value: 'Date Picker Label' } });

    await waitFor(() => {
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Short Answer Label');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Paragraph Label');
      expect(screen.getByTestId('form-preview')).toHaveTextContent('Date Picker Label');
    });
  });

  test('it adds Selection content to the screen', async () => {
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
  });

  test('it uploads an image file successfully', async () => {
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
    Object.defineProperty(file, 'size', { value: 100 * 1024 }); // 100KB

    const mockResult = 'data:image/png;base64,fakebase64content';
    vi.spyOn(window, 'FileReader').mockImplementation(
      () =>
        ({
          readAsDataURL: vi.fn(function (this: any) {
            this.result = mockResult;
            setTimeout(() => {
              if (this.onload) {
                this.onload({ target: { result: mockResult } });
              }
            }, 0);
          }),
          onload: null,
          onerror: null,
          result: null,
        }) as any
    );

    const fileInput = screen.getByTestId('media-content').querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const previewImage = screen.getByAltText('Uploaded media');
      expect(previewImage).toBeInTheDocument();
    });

    expect(screen.getByText('Remove')).toBeInTheDocument();
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

    const file = new File(['fake-content'], 'test.pdf', { type: 'application/pdf' });

    const fileInput = screen.getByTestId('media-content').querySelector('input[type="file"]') as HTMLInputElement;
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

    const file = new File(['fake-image-content'], 'large-image.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 500 * 1024 }); // 500KB - exceeds 300KB limit

    const fileInput = screen.getByTestId('media-content').querySelector('input[type="file"]') as HTMLInputElement;
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
    Object.defineProperty(file, 'size', { value: 100 * 1024 });

    const mockResult = 'data:image/png;base64,fakebase64content';
    vi.spyOn(window, 'FileReader').mockImplementation(
      () =>
        ({
          readAsDataURL: vi.fn(function (this: any) {
            this.result = mockResult;
            setTimeout(() => {
              if (this.onload) {
                this.onload({ target: { result: mockResult } });
              }
            }, 0);
          }),
          onload: null,
          onerror: null,
          result: null,
        }) as any
    );

    const fileInput = screen.getByTestId('media-content').querySelector('input[type="file"]') as HTMLInputElement;
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
});
