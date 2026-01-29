import { render, RenderResult } from '@testing-library/react';
import {
  mockPreviewScreens,
  mockScreen,
  screenWithBody,
  screenWithCaption,
  screenWithDatePicker,
  screenWithDefaultText,
  screenWithDropdown,
  screenWithLargeHeading,
  screenWithMedia,
  screenWithMultipleChoice,
  screenWithMultipleContent,
  screenWithOptIn,
  screenWithParagraph,
  screenWithRequiredField,
  screenWithShortAnswer,
  screenWithSingleChoice,
  screenWithSmallHeading,
} from 'mocks/FormBuilderMocks';
import { Screen } from '../FormBuilder/FormBuilder.types';
import { Preview } from './Preview';

describe('<Preview />', () => {
  const renderPreview = (screens: Screen[] = [], currentScreenIndex: number = 0): RenderResult => {
    return render(<Preview screens={screens} currentScreenIndex={currentScreenIndex} />);
  };

  test('renders the preview container', () => {
    const { getByText } = renderPreview([mockScreen], 0);
    expect(getByText('Managed by the business. Learn more')).toBeInTheDocument();
  });

  test('displays empty state when no screens are provided', () => {
    const { getByText } = renderPreview([], 0);

    expect(getByText('No screens to preview. Add a screen to get started.')).toBeInTheDocument();
  });

  test('displays empty state when currentScreenIndex is out of bounds', () => {
    const { getByText } = renderPreview([mockScreen], 5);

    expect(getByText('No screens to preview. Add a screen to get started.')).toBeInTheDocument();
  });

  test('displays screen name in header', () => {
    const { getByText } = renderPreview([mockScreen], 0);

    expect(getByText('Test Screen')).toBeInTheDocument();
  });

  test('displays button label when provided', () => {
    const { getByText } = renderPreview([mockScreen], 0);

    expect(getByText('Continue')).toBeInTheDocument();
  });

  describe('Text content types', () => {
    test('renders Large Heading', () => {
      const { getByText } = renderPreview([screenWithLargeHeading], 0);

      expect(getByText('Main Title')).toBeInTheDocument();
    });

    test('renders Small Heading', () => {
      const { getByText } = renderPreview([screenWithSmallHeading], 0);

      expect(getByText('Subtitle')).toBeInTheDocument();
    });

    test('renders Caption', () => {
      const { getByText } = renderPreview([screenWithCaption], 0);

      expect(getByText('Caption text')).toBeInTheDocument();
    });

    test('renders Body text', () => {
      const { getByText } = renderPreview([screenWithBody], 0);

      expect(getByText('Body content')).toBeInTheDocument();
    });

    test('renders default text when text is missing', () => {
      const { getByText } = renderPreview([screenWithDefaultText], 0);

      expect(getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Text Answer content types', () => {
    test('renders Short Answer input', () => {
      const { getByText, container } = renderPreview([screenWithShortAnswer], 0);

      expect(getByText('Name')).toBeInTheDocument();
      expect(getByText('*')).toBeInTheDocument();
      const input = container.querySelector('input[type="text"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter your name');
      expect(input).toBeDisabled();
    });

    test('renders Paragraph textarea', () => {
      const { getByText, container } = renderPreview([screenWithParagraph], 0);

      expect(getByText('Description')).toBeInTheDocument();
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder', 'Enter description');
      expect(textarea).toBeDisabled();
      expect(getByText('0 / 600')).toBeInTheDocument();
    });

    test('renders Date Picker input', () => {
      const { getByText, container } = renderPreview([screenWithDatePicker], 0);

      expect(getByText('Select Date')).toBeInTheDocument();
      const input = container.querySelector('input[type="text"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Choose a date');
    });

    test('shows required indicator when required is true', () => {
      const { getAllByText } = renderPreview([screenWithRequiredField], 0);

      const requiredIndicators = getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Selection content types', () => {
    test('renders Single Choice with radio options', () => {
      const { getByText } = renderPreview([screenWithSingleChoice], 0);

      expect(getByText('Choose one')).toBeInTheDocument();
      expect(getByText('Option 1')).toBeInTheDocument();
      expect(getByText('Option 2')).toBeInTheDocument();
      expect(getByText('*')).toBeInTheDocument();
    });

    test('renders Multiple Choice with checkbox options', () => {
      const { getByText } = renderPreview([screenWithMultipleChoice], 0);

      expect(getByText('Choose multiple')).toBeInTheDocument();
      expect(getByText('Option A')).toBeInTheDocument();
      expect(getByText('Option B')).toBeInTheDocument();
      expect(getByText('Option C')).toBeInTheDocument();
    });

    test('renders Dropdown', () => {
      const { getByText } = renderPreview([screenWithDropdown], 0);

      expect(getByText('Select option')).toBeInTheDocument();
      expect(getByText('Select option dropdown')).toBeInTheDocument();
      expect(getByText('▶')).toBeInTheDocument();
    });

    test('renders Opt In checkbox', () => {
      const { getByText } = renderPreview([screenWithOptIn], 0);

      expect(getByText('I agree to terms')).toBeInTheDocument();
      expect(getByText('*')).toBeInTheDocument();
    });
  });

  describe('Media content type', () => {
    test('renders media image', () => {
      const { container } = renderPreview([screenWithMedia], 0);
      const image = container.querySelector('img');

      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Media content');
    });
  });

  describe('Multiple content items', () => {
    test('renders multiple content items in order', () => {
      const { getByText } = renderPreview([screenWithMultipleContent], 0);

      expect(getByText('Title')).toBeInTheDocument();
      expect(getByText('Description')).toBeInTheDocument();
      expect(getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Multiple screens', () => {
    test('displays correct screen based on currentScreenIndex', () => {
      const { getByText, rerender } = renderPreview(mockPreviewScreens, 0);

      expect(getByText('Screen 1')).toBeInTheDocument();
      expect(getByText('First screen content')).toBeInTheDocument();
      expect(getByText('Next')).toBeInTheDocument();

      rerender(<Preview screens={mockPreviewScreens} currentScreenIndex={1} />);

      expect(getByText('Screen 2')).toBeInTheDocument();
      expect(getByText('Second screen content')).toBeInTheDocument();
      expect(getByText('Submit')).toBeInTheDocument();
    });
  });

  test('handles default screens prop', () => {
    const { getByText } = renderPreview([], 0);

    expect(getByText('No screens to preview. Add a screen to get started.')).toBeInTheDocument();
  });
});
