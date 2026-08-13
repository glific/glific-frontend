import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BlocksCard, BlocksResponseCard, parseBlocksResponse } from './BlocksCard';

afterEach(cleanup);

const content = {
  type: 'blocks',
  version: 1,
  component: 'glific/image-panel',
  props: {
    id: 'course',
    body: { kind: 'text', value: 'Pick a course' },
    options: {
      kind: 'list',
      value: [
        {
          id: 'c1',
          image: { kind: 'image', value: 'https://example.com/a.png' },
          image_alt: { kind: 'alt', value: 'Adult English class' },
          label: { kind: 'text', value: 'Spoken English' },
        },
      ],
    },
  },
};

const customBlock = {
  type: 'blocks',
  version: 1,
  component: 'tap/course-picker',
  props: { id: 'answer', body: { kind: 'text', value: 'Pick something' } },
};

describe('BlocksCard', () => {
  test('renders a built-in block with the MUI renderer', () => {
    render(<BlocksCard content={content} disabled />);

    expect(screen.getByTestId('blocksHeader')).toHaveTextContent('Block · glific/image-panel');
    expect(screen.getByTestId('blocksImagePanel')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Adult English class');
    expect(screen.getByText('Spoken English')).toBeInTheDocument();
  });

  test('falls back to the derived body for a Custom Block', () => {
    render(<BlocksCard content={customBlock} disabled />);

    expect(screen.queryByTestId('blocksRenderer')).not.toBeInTheDocument();
    expect(screen.getByTestId('blocksDerivedBody')).toHaveTextContent('Pick something');
  });

  test('collapses the payload until asked', () => {
    render(<BlocksCard content={content} disabled />);

    expect(screen.queryByTestId('blocksPayload')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('blocksPayloadToggle'));
    expect(screen.getByTestId('blocksPayload')).toHaveTextContent('glific/image-panel');

    fireEvent.click(screen.getByTestId('blocksPayloadToggle'));
    expect(screen.queryByTestId('blocksPayload')).not.toBeInTheDocument();
  });

  test('renders the answered state with the response summary', () => {
    render(<BlocksCard content={{ ...content, answered: true, answer_summary: 'Spoken English' }} disabled />);

    expect(screen.getByTestId('blocksCard')).toHaveAttribute('data-answered', 'true');
    expect(screen.getByTestId('blocksAnswered')).toHaveTextContent('Answered: Spoken English');
  });

  test('renders the answered state for a Custom Block too', () => {
    render(<BlocksCard content={{ ...customBlock, answered: true, answer_summary: 'Course A' }} disabled />);
    expect(screen.getByTestId('blocksAnswerSummary')).toHaveTextContent('Answered: Course A');
  });

  test('is never interactive in the inbox', () => {
    render(<BlocksCard content={content} disabled />);
    expect(screen.queryByTestId('blocksRespondButton')).not.toBeInTheDocument();
  });

  test('accepts a typed response in the simulator', () => {
    const onRespond = vi.fn();
    render(<BlocksCard content={content} isSimulator onRespond={onRespond} />);

    fireEvent.change(screen.getByTestId('blocksResponseInput').querySelector('input') as Element, {
      target: { value: 'Digital skills' },
    });
    fireEvent.click(screen.getByTestId('blocksRespondButton'));

    expect(onRespond).toHaveBeenCalledWith({ values: { input: 'Digital skills' }, summary: 'Digital skills' });
  });

  test('does not offer a response once answered', () => {
    render(<BlocksCard content={{ ...content, answered: true, answer_summary: 'x' }} isSimulator />);
    expect(screen.queryByTestId('blocksRespondButton')).not.toBeInTheDocument();
  });
});

describe('BlocksResponseCard', () => {
  const response = {
    type: 'blocks_response',
    component: 'glific/image-panel',
    values: { course: 'c1' },
    summary: 'Spoken English',
  };

  test('shows the summary and collapses the raw response values', () => {
    render(<BlocksResponseCard content={response} />);

    expect(screen.getByTestId('blocksResponseSummary')).toHaveTextContent('Spoken English');
    expect(screen.queryByTestId('blocksResponseValues')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('blocksResponseToggle'));
    expect(screen.getByTestId('blocksResponseValues')).toHaveTextContent('"course": "c1"');
  });
});

describe('parseBlocksResponse', () => {
  test('uses a valid JSON object as values verbatim', () => {
    expect(parseBlocksResponse('{"course": "c2"}').values).toEqual({ course: 'c2' });
  });

  test('wraps plain text as { input }', () => {
    expect(parseBlocksResponse('Digital skills').values).toEqual({ input: 'Digital skills' });
  });

  test('falls back to { input } for malformed JSON and for arrays', () => {
    expect(parseBlocksResponse('{"course":').values).toEqual({ input: '{"course":' });
    expect(parseBlocksResponse('["a"]').values).toEqual({ input: '["a"]' });
  });

  test('clamps the summary to 500 characters', () => {
    expect(parseBlocksResponse('x'.repeat(600)).summary).toHaveLength(500);
  });
});
