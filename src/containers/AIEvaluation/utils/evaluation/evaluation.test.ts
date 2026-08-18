import {
  formatScore,
  parseOverallScore,
  evaluationRunName,
  parseEvaluationSummary,
  shortMetricName,
  parseEvaluationScores,
  traceMetricNames,
  isRunComplete,
  isRunFailed,
  isRunInProgress,
  overallScore,
  parseEvaluationResults,
  scoreBand,
} from './evaluation';

describe('parseEvaluationResults', () => {
  test('reads the summary_scores the judge actually returns', () => {
    const results =
      '{"summary_scores":[' +
      '{"total_pairs":10,"std":0.64,"name":"Adherence to Ground Truth","data_type":"NUMERIC","avg":4.7},' +
      '{"total_pairs":10,"std":0.0,"name":"Adherence to Prompt","data_type":"NUMERIC","avg":5.0}]}';

    // this run had no knowledge base, so that metric is simply absent
    expect(parseEvaluationResults(results)).toEqual({ groundTruth: 4.7, knowledgeBase: null, prompt: 5 });
  });

  test('a knowledge-base score is picked up when the run has one', () => {
    const results = {
      summary_scores: [
        { name: 'Adherence to Knowledge Base', avg: 3.5 },
        { name: 'Adherence to Ground Truth', avg: 4 },
        { name: 'Adherence to Prompt', avg: 5 },
      ],
    };

    expect(parseEvaluationResults(results)).toEqual({ groundTruth: 4, knowledgeBase: 3.5, prompt: 5 });
  });

  test('a metric the app does not show is ignored rather than breaking the rest', () => {
    const results = {
      summary_scores: [
        { name: 'Some future metric', avg: 2 },
        { name: 'Adherence to Prompt', avg: 5 },
      ],
    };

    expect(parseEvaluationResults(results)).toEqual({ groundTruth: null, knowledgeBase: null, prompt: 5 });
  });

  test('reads a flatter object of scores too', () => {
    expect(parseEvaluationResults({ groundTruth: 4.5, knowledgeBase: 3, prompt: 2 })).toEqual({
      groundTruth: 4.5,
      knowledgeBase: 3,
      prompt: 2,
    });
  });

  test('reads the same scores from a JSON string', () => {
    expect(parseEvaluationResults('{"ground_truth":4,"knowledge_base":3,"adherence_to_prompt":5}')).toEqual({
      groundTruth: 4,
      knowledgeBase: 3,
      prompt: 5,
    });
  });

  test('anything unreadable scores nothing rather than zero', () => {
    for (const value of [null, undefined, 'not json', 42, { other: 1 }]) {
      expect(parseEvaluationResults(value)).toEqual({ groundTruth: null, knowledgeBase: null, prompt: null });
    }
  });

  test('a partly scored run keeps the parts it has', () => {
    expect(parseEvaluationResults({ groundTruth: 4 })).toEqual({
      groundTruth: 4,
      knowledgeBase: null,
      prompt: null,
    });
  });
});

describe('overallScore', () => {
  test('weights correctness highest, then grounding, then instructions', () => {
    expect(overallScore({ groundTruth: 4.6, knowledgeBase: 3.2, prompt: 1.4 })).toBe(3.54);
  });

  test('weights are re-normalised over the metrics a run actually scored', () => {
    // ground truth .5 and prompt .2, so (4.7*.5 + 5*.2) / .7
    expect(overallScore({ groundTruth: 4.7, knowledgeBase: null, prompt: 5 })).toBe(4.79);
  });

  test('one metric alone is its own overall score', () => {
    expect(overallScore({ groundTruth: null, knowledgeBase: null, prompt: 4.2 })).toBe(4.2);
  });

  test('a run that scored nothing has no overall score', () => {
    expect(overallScore({ groundTruth: null, knowledgeBase: null, prompt: null })).toBeNull();
  });
});

describe('scoreBand', () => {
  test('0-1 is bad, 2-3 could improve, 4-5 is good', () => {
    expect(scoreBand(0)).toBe('bad');
    expect(scoreBand(1.9)).toBe('bad');
    expect(scoreBand(2)).toBe('okay');
    expect(scoreBand(3.9)).toBe('okay');
    expect(scoreBand(4)).toBe('good');
    expect(scoreBand(5)).toBe('good');
  });
});

describe('formatScore', () => {
  test('keeps the judge’s precision, gives a whole number one decimal, dashes when there is none', () => {
    expect(formatScore(2.27)).toBe('2.27');
    expect(formatScore(1.47)).toBe('1.47');
    expect(formatScore(2.5)).toBe('2.5');
    expect(formatScore(5)).toBe('5.0');
    expect(formatScore(4)).toBe('4.0');
    expect(formatScore(null)).toBe('—');
  });
});

describe('parseOverallScore', () => {
  test('reads the overall the judge reported', () => {
    expect(parseOverallScore(JSON.stringify({ score: { overall: { overall_score: 2.58 } } }))).toBe(2.58);
  });

  test('a payload without one reports nothing rather than guessing', () => {
    for (const value of [null, 'not json', '{}', '{"score":{}}', { score: { overall: {} } }]) {
      expect(parseOverallScore(value)).toBeNull();
    }
  });
});

describe('run status', () => {
  const run = (status: string) => ({ id: 'r', name: 'n', status, insertedAt: '' });

  test('a finished run is complete, whichever word or case the backend uses', () => {
    expect(isRunComplete(run('success'))).toBe(true);
    expect(isRunComplete(run('completed'))).toBe(true);
    expect(isRunComplete(run('COMPLETED'))).toBe(true);
    expect(isRunInProgress(run('COMPLETED'))).toBe(false);
  });

  test('a broken run is failed', () => {
    expect(isRunFailed(run('failed'))).toBe(true);
    expect(isRunFailed(run('FAILED'))).toBe(true);
    expect(isRunFailed(run('error'))).toBe(true);
  });

  test('anything else is still going, including a status we have not seen', () => {
    expect(isRunInProgress(run('pending'))).toBe(true);
    expect(isRunInProgress(run('queued_for_the_judge'))).toBe(true);
    expect(isRunInProgress(run('success'))).toBe(false);
  });
});

describe('parseEvaluationScores', () => {
  const payload = JSON.stringify({
    score: {
      traces: [
        {
          question_id: '2',
          question: 'What is anaemia?',
          ground_truth_answer: 'Low haemoglobin.',
          llm_answer: 'A blood condition.',
          scores: [{ name: 'Adherence to Ground Truth', value: 4.5 }],
        },
        {
          question_id: '1',
          question: 'What is diabetes?',
          golden_answer: 'A metabolic disease.',
          llm_answer: 'A chronic condition.',
          scores: [
            { name: 'Adherence to Ground Truth', value: 3 },
            { name: 'Adherence to Prompt', value: 5 },
          ],
        },
      ],
    },
  });

  test('reads each question the run asked', () => {
    const traces = parseEvaluationScores(payload);

    expect(traces).toHaveLength(2);
    expect(traces[0]).toMatchObject({
      questionId: '1',
      question: 'What is diabetes?',
      expected: 'A metabolic disease.',
      answer: 'A chronic condition.',
    });
  });

  test('questions come back in numeric order, not the order the judge wrote them', () => {
    expect(parseEvaluationScores(payload).map((trace) => trace.questionId)).toEqual(['1', '2']);
  });

  test('either name for the expected answer is read', () => {
    const traces = parseEvaluationScores(payload);

    expect(traces[0].expected).toBe('A metabolic disease.');
    expect(traces[1].expected).toBe('Low haemoglobin.');
  });

  test('every metric the run scored is collected, in first-seen order', () => {
    expect(traceMetricNames(parseEvaluationScores(payload))).toEqual([
      'Adherence to Ground Truth',
      'Adherence to Prompt',
    ]);
  });

  test('a question missing a metric leaves it unscored rather than zero', () => {
    const traces = parseEvaluationScores(payload);

    expect(traces[1].scores.find((score) => score.name === 'Adherence to Prompt')).toBeUndefined();
  });

  test('anything unreadable is no questions at all', () => {
    for (const value of [null, undefined, 'not json', '{}', '{"score":{}}', 42]) {
      expect(parseEvaluationScores(value)).toEqual([]);
    }
  });

  test('a bare array of traces is read too', () => {
    expect(parseEvaluationScores([{ question_id: '1', question: 'Q', llm_answer: 'A' }])).toHaveLength(1);
  });
});

describe('shortMetricName', () => {
  test('drops the prefix every metric shares', () => {
    expect(shortMetricName('Adherence to Ground Truth')).toBe('Ground Truth');
    expect(shortMetricName('adherence to prompt')).toBe('prompt');
  });

  test('a name without the prefix is left alone', () => {
    expect(shortMetricName('Cosine Similarity')).toBe('Cosine Similarity');
  });

  test('a name that is only the prefix keeps something to show', () => {
    expect(shortMetricName('Adherence to')).toBe('Adherence to');
  });
});

describe('parseEvaluationSummary', () => {
  test("reads the judge's write-up and trims it", () => {
    const payload = JSON.stringify({
      score: { overall: { ai_summary: '  Overall the run looks healthy. The one mild gap is item_0.  ' } },
    });

    expect(parseEvaluationSummary(payload)).toBe('Overall the run looks healthy. The one mild gap is item_0.');
  });

  test('a run with nothing to report reads as no summary', () => {
    for (const value of [
      null,
      'not json',
      '{}',
      '{"score":{}}',
      { score: { overall: null } },
      { score: { overall: { ai_summary: '   ' } } },
    ]) {
      expect(parseEvaluationSummary(value)).toBeNull();
    }
  });
});

describe('evaluationRunName', () => {
  test('folds the assistant, version and set into one lowercase name', () => {
    expect(evaluationRunName('Maternal Health Bot', 3, 'core_set')).toMatch(/^maternal_health_bot_v3_core_set_\d+$/);
  });

  test('a set named with punctuation cannot leak into the name', () => {
    expect(evaluationRunName('Bot', 1, 'ANC / PNC (v2)!')).toMatch(/^bot_v1_anc_pnc_v2_\d+$/);
  });

  test('a version-less run is filed under v1', () => {
    expect(evaluationRunName('Bot', undefined, 'set')).toMatch(/^bot_v1_set_\d+$/);
  });
});
