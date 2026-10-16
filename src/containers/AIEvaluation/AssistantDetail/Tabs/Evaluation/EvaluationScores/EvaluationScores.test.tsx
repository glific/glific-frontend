import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { downloadCsv, toCsv } from 'containers/AIEvaluation/utils/csv/csv';
import { parseEvaluationScores } from 'containers/AIEvaluation/utils/evaluation/evaluation';
import { guardrailTraces } from 'mocks/AIEvaluations';
import { EvaluationScores } from './EvaluationScores';

vi.mock('containers/AIEvaluation/utils/csv/csv', async () => {
  const actual = await vi.importActual<typeof import('containers/AIEvaluation/utils/csv/csv')>(
    'containers/AIEvaluation/utils/csv/csv'
  );
  return { ...actual, downloadCsv: vi.fn() };
});

const renderScores = (props: Partial<Parameters<typeof EvaluationScores>[0]> = {}) =>
  render(<EvaluationScores runId="r1" traces={parseEvaluationScores(guardrailTraces)} {...props} />);

const rowFor = (index: number) => screen.getAllByTestId('evaluationScoreRow')[index];

describe('what the guardrails did with each answer', () => {
  test('a blocked question shows no answer, and says why it was blocked', () => {
    renderScores();
    const note = within(rowFor(0)).getByTestId('answerGuardrail');

    expect(within(rowFor(0)).getAllByText('—').length).toBeGreaterThan(0);
    expect(note).toHaveTextContent('Blocked by guardrail');
    expect(note).toHaveTextContent('PII detected in the text.');
    // nothing reached the model, so there is nothing more to show
    expect(within(note).queryByTestId('guardrailDetails')).not.toBeInTheDocument();
  });

  test('an answer let through is marked as such, with what was sent to the model on hover', async () => {
    renderScores();
    const note = within(rowFor(1)).getByTestId('answerGuardrail');

    expect(note).toHaveTextContent('Guardrails applied');

    fireEvent.mouseOver(within(note).getByTestId('guardrailDetails'));

    await waitFor(() => expect(screen.getByText('Input to LLM')).toBeInTheDocument());
    expect(screen.getByText('Output from LLM')).toBeInTheDocument();
    expect(screen.getAllByText('What is the sequence of taxonomic categories?').length).toBeGreaterThan(1);
  });

  test('a run from before guardrails shows nothing extra', () => {
    renderScores();

    expect(within(rowFor(2)).queryByTestId('answerGuardrail')).not.toBeInTheDocument();
  });

  test('a status the tab has no wording for is shown as it came', () => {
    renderScores({ traces: parseEvaluationScores([{ question_id: '1', llm_answer: 'A', guardrail: 'rephrased' }]) });

    expect(screen.getByTestId('answerGuardrail')).toHaveTextContent('rephrased');
  });

  test('the grouped view shows it under each answer too', () => {
    renderScores({ format: 'grouped' });

    expect(within(rowFor(0)).getByTestId('answerGuardrail')).toHaveTextContent('Blocked by guardrail');
  });

  test('the CSV export carries what the guardrails did', () => {
    renderScores();

    fireEvent.click(screen.getByTestId('exportScoresButton'));

    expect(downloadCsv).toHaveBeenCalledWith(
      'evaluation-r1-question-level-results.csv',
      toCsv([
        [
          'Question',
          'Expected answer',
          'Assistant answer',
          'Guardrail',
          'Input to LLM',
          'Output from LLM',
          'Adherence to Ground Truth',
        ],
        [
          'What is the definition of health, Himanshu?',
          'Health is complete well-being.',
          '',
          'blocked: PII detected in the text.',
          '',
          '',
          '',
        ],
        [
          'What is the sequence of taxonomic categories?',
          'Species → Genus → Family → Order → Class → Phylum → Kingdom.',
          'Species, Genus, Family, Order, Class, Phylum, Kingdom.',
          'applied',
          'What is the sequence of taxonomic categories?',
          '',
          '5',
        ],
        [
          'What is taxonomy?',
          'Naming and classifying organisms.',
          'The science of naming and classifying organisms.',
          '',
          '',
          '',
          '4',
        ],
      ])
    );
  });

  test('a run without guardrails exports the columns it always had', () => {
    renderScores({ traces: parseEvaluationScores([guardrailTraces[2]]) });

    fireEvent.click(screen.getByTestId('exportScoresButton'));

    const [, csv] = vi.mocked(downloadCsv).mock.calls.at(-1)!;
    expect(csv.split('\n')[0]).not.toContain('Guardrail');
  });
});
