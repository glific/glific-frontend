import { BELOW_STICKY_HEADER } from '../../utils/assistant-flow';
import {
  EMPTY_SCORES,
  FAILED_RUN,
  GOLDEN_SETS,
  LIVE_VERSION_ID,
  RUNNING_RUN,
  RUN_ID,
  SET_ID,
  UNSCORED_SCORES,
  WEAK_SCORES,
} from '../../utils/assistant-fixtures';
import { openAssistant, openAssistantPage, openTab } from '../../utils/assistant-detail';

describe('the Golden Q&A Evaluation tab of a saved assistant', () => {
  beforeEach(() => {
    openAssistant();
    openTab('evaluation');
  });

  it('shows how the version scored last time', () => {
    cy.get('[data-testid="evaluationResult"]').should('be.visible');
    cy.get('[data-testid="overallScore"]').should('contain', '4.32');
    cy.get('[data-testid="scoreBand"]').should('contain', 'Good');
    cy.get('[data-testid="evaluationSummary"]').should('contain', 'Answers hold up well');
    cy.get('[data-testid="metric-groundTruth"]').should('be.visible');
    cy.get('[data-testid="scoreBar"]').should('have.length.greaterThan', 0);
  });

  it('lists the question-level results of that run', () => {
    cy.get('[data-testid="evaluationScores"]').should('be.visible');
    cy.get('[data-testid="evaluationScoreRow"]').should('have.length', 2);
    cy.get('[data-testid="evaluationScoreRow"]')
      .first()
      .should('contain', 'When is the first check-up?')
      .and('contain', 'In the first trimester.');
  });

  it('runs an evaluation against the set and duplication that were picked', () => {
    cy.get('[data-testid="runEvaluationButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="runEvaluationDialog"]').should('be.visible');

    // the set says how big the run is about to be, and the last one used is marked
    cy.get('[data-testid="setSize-g1"]').should('contain', '120 questions');
    cy.get('[data-testid="lastUsedSet"]').should('be.visible');

    cy.get('[data-testid="duplicationOption-5"]').click();
    cy.get('[data-testid="ok-button"]').click();

    cy.wait('@createEvaluation').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(input.goldenQaId).to.eq(SET_ID);
      expect(input.configId).to.eq(LIVE_VERSION_ID);
      expect(input.duplicationFactor).to.eq(5);
    });
    cy.contains('Evaluation started').should('be.visible');
  });

  it('manages the Golden Q&A sets from the same tab', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="manageGoldenQaSetsDialog"]').should('be.visible');
    cy.get('[data-testid="manageGoldenQaSet"]').should('have.length', GOLDEN_SETS.length);
    cy.get('[data-testid="goldenQaSetItems"]').first().should('contain', '120 questions');
    cy.get('[data-testid="addGoldenQaSetButton"]').should('be.visible');
  });

  it('opens a set to read the questions it holds', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', {
      body: 'question,answer\nWhen is the first check-up?,In the first trimester.',
    }).as('goldenQaFile');

    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="manageGoldenQaSet"]').first().click();

    cy.get('[data-testid="viewGoldenQaSetDialog"]').should('be.visible');
    cy.get('[data-testid="goldenQaViewRow"]').should('contain', 'When is the first check-up?');
  });

  it('lists past runs under History, and narrows them to one Golden Q&A', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="evaluationHistory"]').should('be.visible');
    cy.get('[data-testid="evaluationRun"]').should('have.length', 1);
    cy.get('[data-testid="evaluationRun"]').first().should('contain', 'maternal_health_core');

    cy.get('[data-testid="evaluationHistory"]')
      .find('[data-testid="dropdown"]')
      .find('[role="combobox"]')
      .click();
    cy.get('[data-testid="historyFilterMenu"]').contains('maternal_health_core').click();

    cy.wait('@AiEvaluationsFiltered').then((interception) => {
      expect(interception.request.body.variables?.filter?.goldenQaId).to.eq(SET_ID);
    });
  });
});

describe('an evaluation that is not a finished, scored run', () => {
  it('says a run is still going, on the tab as well as in the panel', () => {
    openAssistant({ runs: [RUNNING_RUN] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationRunning"]').should('contain', 'Evaluation in progress');
    cy.get('[data-testid="tabRunningDot-evaluation"]').should('exist');
    cy.get('[data-testid="runEvaluationButton"]').should('be.disabled');
  });

  it('says why a run failed', () => {
    openAssistant({ runs: [FAILED_RUN] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationFailed"]').should('contain', 'The judge timed out');
    cy.get('[data-testid="evaluationResult"]').should('not.exist');
  });
});

describe('reading and exporting the results', () => {
  beforeEach(() => {
    openAssistant();
    openTab('evaluation');
  });

  it('groups the answers by question when asked to', () => {
    cy.get('[data-testid="evaluationScoreRow"]').should('have.length', 2);

    cy.get('[data-testid="scoresFormatToggle-grouped"]').click(BELOW_STICKY_HEADER);

    // grouped, the same question carries a column per answer it was given
    cy.get('[data-testid="evaluationScoreRow"]').should('have.length', 1);
    cy.contains('Answer 1').should('be.visible');
    cy.contains('Answer 2').should('be.visible');
  });

  it('exports the question-level results as a CSV', () => {
    cy.window().then((win) => {
      cy.stub(win.URL, 'createObjectURL').as('objectUrl').returns('blob:stub');
    });

    cy.get('[data-testid="exportScoresButton"]').click(BELOW_STICKY_HEADER);
    cy.get('@objectUrl').should('have.been.called');
  });

  it('explains what the Overall column means', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="historyOverallHint"]').trigger('mouseover', BELOW_STICKY_HEADER);

    cy.get('[role="tooltip"]').should('contain', 'weighted average');
  });

  it('exports the history as a CSV', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);
    cy.window().then((win) => {
      cy.stub(win.URL, 'createObjectURL').as('objectUrl').returns('blob:stub');
    });

    cy.get('[data-testid="exportHistoryButton"]').click(BELOW_STICKY_HEADER);
    cy.get('@objectUrl').should('have.been.called');
  });
});

describe('the prompt suggestion under a run', () => {
  it('has nothing to suggest when the run scores well', () => {
    openAssistant();
    openTab('evaluation');

    cy.get('[data-testid="suggestedPromptNone"]').should('contain', 'Nothing to change');
  });

  it('names the weakest check and can be applied', () => {
    openAssistant({ scores: WEAK_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="suggestedPrompt"]').scrollIntoView().should('be.visible');
    cy.get('[data-testid="whyThisChangeButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="whyThisChange"]').should('contain', 'knowledge base');

    cy.get('[data-testid="applySuggestionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@ImproveEvaluationPrompt').then((interception) => {
      expect(interception.request.body.variables?.evaluationId).to.eq(RUN_ID);
    });
    cy.contains('Prompt improvement started').should('be.visible');
  });

  it('can be dismissed and brought back', () => {
    openAssistant({ scores: WEAK_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="dismissSuggestionButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="suggestedPromptDismissed"]').should('contain', 'Suggestion dismissed');

    cy.get('[data-testid="restoreSuggestionButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="suggestedPrompt"]').scrollIntoView().should('be.visible');
  });
});

describe('an assistant with nothing run against it yet', () => {
  beforeEach(() => {
    openAssistant({ runs: [] });
    openTab('evaluation');
  });

  it('says this version has never been evaluated', () => {
    cy.get('[data-testid="noEvaluationsYet"]').should(
      'contain',
      'No evaluations yet for version 2.0'
    );
  });

  it('says the history is empty, and leads back to running one', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="evaluationHistoryEmpty"]').should('contain', 'No evaluations yet');
    cy.get('[data-testid="runFirstEvaluationButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="noEvaluationsYet"]').should('be.visible');
  });

  it('takes the reader from the run panel to the history', () => {
    cy.get('[data-testid="goToHistoryButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="evaluationHistoryEmpty"]').should('be.visible');
  });
});

describe('when the server does not answer', () => {
  it('says so plainly when the assistant cannot be loaded', () => {
    openAssistantPage({ assistantMissing: true });

    cy.get('[data-testid="assistantNotFound"]').should('contain', 'Assistant not found');
  });

  it('recovers the Golden Q&A list when the retry is taken', () => {
    openAssistant({ failsOnce: ['GoldenQas'] });
    openTab('evaluation');

    cy.get('[data-testid="goldenQaLoadError"]').should('contain', 'Golden Q&A could not be loaded');
    cy.get('[data-testid="retryGoldenQaButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="goldenQaLoadError"]').should('not.exist');
    cy.get('[data-testid="evaluationSubTabs"]').should('be.visible');
    cy.get('[data-testid="manageSetsButton"]').should('be.visible');
  });

  it('recovers the run history when the retry is taken', () => {
    openAssistant({ failsOnce: ['AiEvaluations'] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationRunsLoadError"]').should(
      'contain',
      'Evaluation runs could not be loaded'
    );
    cy.get('[data-testid="retryRunsButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="evaluationRunsLoadError"]').should('not.exist');
    cy.get('[data-testid="evaluationResult"]').should('be.visible');
  });

  it('says the question-level results could not be loaded', () => {
    openAssistant({ fails: ['EvaluationScores'] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationScoresError"]').scrollIntoView().should('be.visible');
  });

  it('says so when a run produced no question-level rows', () => {
    openAssistant({ scores: EMPTY_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="evaluationScoresEmpty"]').scrollIntoView().should('be.visible');
    cy.get('[data-testid="evaluationScoreRow"]').should('not.exist');
  });

  it('waits for the scores rather than showing a half-built card', () => {
    openAssistant({ scoresDelay: 1500 });
    openTab('evaluation');

    cy.get('[data-testid="evaluationScoreLoading"]').should('be.visible');
    cy.get('[data-testid="overallScore"]', { timeout: 10000 }).should('contain', '4.32');
  });
});

describe('the judge’s reasons', () => {
  it('carries the judge’s reason beside each score', () => {
    openAssistant();
    openTab('evaluation');

    cy.get('[data-testid="scoreReason"]').first().should('exist');
    cy.get('[data-testid="evaluationScoresTable"]').scrollIntoView().should('be.visible');
  });
});

describe('a run with nothing to suggest from', () => {
  it('has no suggestion to make when no check reported a score', () => {
    openAssistant({ scores: UNSCORED_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="suggestedPromptUnscored"]').should(
      'contain',
      'No suggestion for this run'
    );
  });
});
