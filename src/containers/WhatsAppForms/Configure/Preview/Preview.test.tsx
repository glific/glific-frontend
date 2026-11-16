import { render, screen } from '@testing-library/react';
import { Screen } from '../FormBuilder/FormBuilder.types';
import { Preview } from './Preview';

const screenWith = (rawComponent: object): Screen[] => [
  {
    id: '1',
    name: 'Welcome',
    order: 0,
    buttonLabel: 'Continue',
    content: [{ id: 'raw', type: 'Unsupported', name: (rawComponent as any).type, order: 0, data: { rawComponent } }],
  },
];

describe('Preview — non-editable components', () => {
  test('shows the text of an EmbeddedLink', () => {
    const embeddedLink = {
      type: 'EmbeddedLink',
      text: 'Read the terms first',
      'on-click-action': { name: 'navigate', next: { type: 'screen', name: 'TERMS' }, payload: {} },
    };

    render(<Preview screens={screenWith(embeddedLink)} currentScreenIndex={0} />);

    expect(screen.getByTestId('preview-embedded-link')).toHaveTextContent('Read the terms first');
  });

  test.each([
    [{ type: 'RichText', text: ['# Terms'] }, 'Rich text – shown in WhatsApp'],
    [{ type: 'CalendarPicker', name: 'appointment', label: 'Date' }, 'Calendar picker – shown in WhatsApp'],
    [{ type: 'NavigationList', name: 'plans', 'list-items': [] }, 'Navigation list – shown in WhatsApp'],
    [{ type: 'ImageCarousel', images: [] }, 'Image carousel – shown in WhatsApp'],
    [{ type: 'PhotoPicker', name: 'photo', label: 'Photo' }, 'Photo upload – shown in WhatsApp'],
    [{ type: 'DocumentPicker', name: 'docs', label: 'Docs' }, 'Document upload – shown in WhatsApp'],
    [{ type: 'ChipsSelector', name: 'topics', label: 'Topics' }, 'Chips selector – shown in WhatsApp'],
    [{ type: 'If', condition: '${form.x}', then: [] }, 'Conditional content – shown in WhatsApp'],
    [{ type: 'Switch', value: '${data.plan}', cases: {} }, 'Conditional content – shown in WhatsApp'],
    [
      { type: 'Dropdown', name: 'state', label: 'State', 'data-source': '${data.states}' },
      'Dropdown – shown in WhatsApp',
    ],
  ])('shows a placeholder for $type', (rawComponent, expected) => {
    render(<Preview screens={screenWith(rawComponent)} currentScreenIndex={0} />);

    expect(screen.getByTestId('preview-placeholder')).toHaveTextContent(expected);
  });

  test('shows a start and an end placeholder for a range CalendarPicker', () => {
    const rangePicker = { type: 'CalendarPicker', name: 'stay', mode: 'range', label: { 'start-date': 'In' } };
    render(<Preview screens={screenWith(rangePicker)} currentScreenIndex={0} />);

    const placeholders = screen.getAllByTestId('preview-placeholder');
    expect(placeholders.map((p) => p.textContent)).toEqual([
      'Calendar picker (start date) – shown in WhatsApp',
      'Calendar picker (end date) – shown in WhatsApp',
    ]);
  });

  test.each([
    ['Single Choice', 'RadioButtonsGroup'],
    ['Multiple Choice', 'CheckboxGroup'],
  ])('greys out a disabled %s option', (name) => {
    const screens: Screen[] = [
      {
        id: '1',
        name: 'Preferences',
        order: 0,
        buttonLabel: 'Continue',
        content: [
          {
            id: 'contact',
            type: 'Selection',
            name,
            order: 0,
            data: {
              label: 'Preferred contact',
              options: [
                { id: 'whatsapp', value: 'WhatsApp' },
                { id: 'call', value: 'Phone call', extraAttributes: { enabled: false } },
              ],
            },
          },
        ],
      },
    ];

    render(<Preview screens={screens} currentScreenIndex={0} />);

    expect(screen.getByText('Phone call').parentElement).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('WhatsApp').parentElement).toHaveAttribute('aria-disabled', 'false');
  });

  test('names a component type it has no label for after its type', () => {
    render(<Preview screens={screenWith({ type: 'FutureWidget' })} currentScreenIndex={0} />);

    expect(screen.getByTestId('preview-placeholder')).toHaveTextContent('FutureWidget – shown in WhatsApp');
  });

  test('does not treat inherited object keys as known component types', () => {
    render(<Preview screens={screenWith({ type: '__proto__' })} currentScreenIndex={0} />);

    expect(screen.getByTestId('preview-placeholder')).toHaveTextContent('__proto__ – shown in WhatsApp');
  });
});
