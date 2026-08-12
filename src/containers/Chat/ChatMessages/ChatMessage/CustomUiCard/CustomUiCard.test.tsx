import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CustomUiCard, parseCustomUiResponse } from './CustomUiCard';

afterEach(cleanup);

const content = {
  type: 'custom_ui',
  version: '1',
  component: 'glific/image_panel',
  props: { id: 'course', options: [{ id: 'c1', image: 'https://example.com/a.png', label: 'Spoken English' }] },
  fallback: 'Pick a course: Spoken English',
};

describe('CustomUiCard', () => {
  test('shows the component name and the fallback text', () => {
    render(<CustomUiCard content={content} disabled />);

    expect(screen.getByTestId('customUiHeader')).toHaveTextContent('Interactive · glific/image_panel');
    expect(screen.getByTestId('customUiFallback')).toHaveTextContent('Pick a course: Spoken English');
  });

  test('collapses the payload until asked', () => {
    render(<CustomUiCard content={content} disabled />);

    expect(screen.queryByTestId('customUiPayload')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('customUiPayloadToggle'));
    expect(screen.getByTestId('customUiPayload')).toHaveTextContent('glific/image_panel');

    fireEvent.click(screen.getByTestId('customUiPayloadToggle'));
    expect(screen.queryByTestId('customUiPayload')).not.toBeInTheDocument();
  });

  test('renders the answered state with the response summary', () => {
    render(<CustomUiCard content={{ ...content, answered: true, answer_summary: 'Spoken English' }} disabled />);

    expect(screen.getByTestId('customUiCard')).toHaveAttribute('data-answered', 'true');
    expect(screen.getByTestId('customUiAnswerSummary')).toHaveTextContent('Answered: Spoken English');
  });

  test('is never interactive in the inbox', () => {
    render(<CustomUiCard content={content} disabled />);
    expect(screen.queryByTestId('customUiRespondButton')).not.toBeInTheDocument();
  });

  test('accepts a typed response in the simulator', () => {
    const onRespond = vi.fn();
    render(<CustomUiCard content={content} isSimulator onRespond={onRespond} />);

    fireEvent.change(screen.getByTestId('customUiResponseInput').querySelector('input') as Element, {
      target: { value: 'Digital skills' },
    });
    fireEvent.click(screen.getByTestId('customUiRespondButton'));

    expect(onRespond).toHaveBeenCalledWith({ values: { input: 'Digital skills' }, summary: 'Digital skills' });
  });

  test('does not offer a response once answered', () => {
    render(<CustomUiCard content={{ ...content, answered: true, answer_summary: 'x' }} isSimulator />);
    expect(screen.queryByTestId('customUiRespondButton')).not.toBeInTheDocument();
  });
});

describe('parseCustomUiResponse', () => {
  test('uses a valid JSON object as values verbatim', () => {
    expect(parseCustomUiResponse('{"course": "c2"}').values).toEqual({ course: 'c2' });
  });

  test('wraps plain text as { input }', () => {
    expect(parseCustomUiResponse('Digital skills').values).toEqual({ input: 'Digital skills' });
  });

  test('falls back to { input } for malformed JSON and for arrays', () => {
    expect(parseCustomUiResponse('{"course":').values).toEqual({ input: '{"course":' });
    expect(parseCustomUiResponse('["a"]').values).toEqual({ input: '["a"]' });
  });

  test('clamps the summary to 500 characters', () => {
    expect(parseCustomUiResponse('x'.repeat(600)).summary).toHaveLength(500);
  });
});
