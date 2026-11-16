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

  test('shows a placeholder for RichText', () => {
    render(<Preview screens={screenWith({ type: 'RichText', text: ['# Terms'] })} currentScreenIndex={0} />);

    expect(screen.getByTestId('preview-rich-text-placeholder')).toHaveTextContent('Rich text – shown in WhatsApp');
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

  test('keeps other non-editable components hidden', () => {
    render(<Preview screens={screenWith({ type: 'NavigationList', name: 'plans' })} currentScreenIndex={0} />);

    expect(screen.queryByTestId('preview-embedded-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('preview-rich-text-placeholder')).not.toBeInTheDocument();
  });
});
