import { Screen, ContentItem } from 'containers/WhatsAppForms/Configure/FormBuilder/FormBuilder.types';

// Basic mock screen
export const mockScreen: Screen = {
    id: '1',
    name: 'Test Screen',
    order: 0,
    content: [],
    buttonLabel: 'Continue',
};

// Content items for different types
export const createTextContentItem = (name: string, text: string): ContentItem => ({
    id: `text-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    type: 'Text',
    order: 0,
    data: { text },
});

export const createTextAnswerContentItem = (
    name: string,
    label: string,
    placeholder?: string,
    required = false
): ContentItem => ({
    id: `text-answer-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    type: 'Text Answer',
    order: 0,
    data: {
        label,
        placeholder,
        required,
    },
});

export const createSelectionContentItem = (
    name: string,
    label: string,
    options: Array<{ id: string; value: string }>,
    required = false
): ContentItem => ({
    id: `selection-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    type: 'Selection',
    order: 0,
    data: {
        label,
        options,
        required,
    },
});

export const createMediaContentItem = (imageUrl: string): ContentItem => ({
    id: 'media-1',
    name: 'Image',
    type: 'Media',
    order: 0,
    data: {
        text: imageUrl,
    },
});

// Screen variations for Preview tests
export const createScreenWithContent = (content: ContentItem[], name = 'Test Screen'): Screen => ({
    id: '1',
    name,
    order: 0,
    content,
    buttonLabel: 'Continue',
});

// Text content type screens
export const screenWithLargeHeading: Screen = createScreenWithContent([
    createTextContentItem('Large Heading', 'Main Title'),
]);

export const screenWithSmallHeading: Screen = createScreenWithContent([
    createTextContentItem('Small Heading', 'Subtitle'),
]);

export const screenWithCaption: Screen = createScreenWithContent([
    createTextContentItem('Caption', 'Caption text'),
]);

export const screenWithBody: Screen = createScreenWithContent([
    createTextContentItem('Body', 'Body content'),
]);

export const screenWithDefaultText: Screen = createScreenWithContent([
    {
        id: '1',
        name: 'Body',
        type: 'Text',
        order: 0,
        data: {},
    },
]);

// Text Answer content type screens
export const screenWithShortAnswer: Screen = createScreenWithContent([
    createTextAnswerContentItem('Short Answer', 'Name', 'Enter your name', true),
]);

export const screenWithParagraph: Screen = createScreenWithContent([
    createTextAnswerContentItem('Paragraph', 'Description', 'Enter description', false),
]);

export const screenWithDatePicker: Screen = createScreenWithContent([
    createTextAnswerContentItem('Date Picker', 'Select Date', 'Choose a date'),
]);

export const screenWithRequiredField: Screen = createScreenWithContent([
    createTextAnswerContentItem('Short Answer', 'Required Field', undefined, true),
]);

// Selection content type screens
export const screenWithSingleChoice: Screen = createScreenWithContent([
    createSelectionContentItem(
        'Single Choice',
        'Choose one',
        [
            { id: 'opt1', value: 'Option 1' },
            { id: 'opt2', value: 'Option 2' },
        ],
        true
    ),
]);

export const screenWithMultipleChoice: Screen = createScreenWithContent([
    createSelectionContentItem(
        'Multiple Choice',
        'Choose multiple',
        [
            { id: 'opt1', value: 'Option A' },
            { id: 'opt2', value: 'Option B' },
            { id: 'opt3', value: 'Option C' },
        ],
        false
    ),
]);

export const screenWithDropdown: Screen = createScreenWithContent([
    createSelectionContentItem('Dropdown', 'Select option', [], true),
]);

export const screenWithOptIn: Screen = createScreenWithContent([
    createSelectionContentItem('Opt In', 'I agree to terms', [], true),
]);

// Media content type screen
export const screenWithMedia: Screen = createScreenWithContent([
    createMediaContentItem('https://example.com/image.jpg'),
]);

// Multiple content items screen
export const screenWithMultipleContent: Screen = createScreenWithContent([
    createTextContentItem('Large Heading', 'Title'),
    createTextContentItem('Body', 'Description'),
    createTextAnswerContentItem('Short Answer', 'Name', undefined, true),
]);

// Multiple screens for Preview tests
export const mockPreviewScreens: Screen[] = [
    {
        id: '1',
        name: 'Screen 1',
        order: 0,
        content: [
            {
                id: '1',
                name: 'Body',
                type: 'Text',
                order: 0,
                data: { text: 'First screen content' },
            },
        ],
        buttonLabel: 'Next',
    },
    {
        id: '2',
        name: 'Screen 2',
        order: 1,
        content: [
            {
                id: '2',
                name: 'Body',
                type: 'Text',
                order: 0,
                data: { text: 'Second screen content' },
            },
        ],
        buttonLabel: 'Submit',
    },
];
