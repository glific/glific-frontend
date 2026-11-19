import { render, screen } from '@testing-library/react';
import { EvaluationLatency } from './EvaluationLatency';

test('the chip shows how long the assistant took, on average, to answer', () => {
  render(<EvaluationLatency avgResponseMs={1800} variant="chip" />);

  expect(screen.getByTestId('evaluationLatency')).toHaveTextContent('Avg response time 1.8 s');
});

test('the table cell shows just the time', () => {
  render(<EvaluationLatency avgResponseMs={65000} variant="text" />);

  expect(screen.getByTestId('evaluationLatency')).toHaveTextContent(/^1 min 5 s$/);
});

test('a run with no response time shows nothing on the card, and a dash in the table', () => {
  const { container, rerender } = render(<EvaluationLatency avgResponseMs={null} variant="chip" />);
  expect(container).toBeEmptyDOMElement();

  rerender(<EvaluationLatency avgResponseMs={null} variant="text" />);
  expect(screen.getByText('—')).toBeInTheDocument();
  expect(screen.queryByTestId('evaluationLatency')).not.toBeInTheDocument();
});
