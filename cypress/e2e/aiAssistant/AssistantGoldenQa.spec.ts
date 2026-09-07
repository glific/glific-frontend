import { BELOW_STICKY_HEADER } from '../../utils/assistant-flow';
import { openAssistant, openTab } from '../../utils/assistant-detail';

describe('adding a Golden Q&A from the evaluation tab', () => {
  beforeEach(() => {
    openAssistant();
    openTab('evaluation');
  });

  it('reads the file that was picked before it is uploaded', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();

    cy.get('[data-testid="goldenQaFileInput"]').selectFile('cypress/fixtures/golden-qa.csv', {
      force: true,
    });

    // the name comes from the file, and the questions are shown before anything is sent
    cy.get('[data-testid="goldenQaNameInput"]').should('have.value', 'golden_qa');
    cy.get('[data-testid="goldenQaParsed"]').should('contain', 'Parsed 2 questions');
  });

  it('uploads it and reports it added', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();
    cy.get('[data-testid="goldenQaFileInput"]').selectFile('cypress/fixtures/golden-qa.csv', {
      force: true,
    });
    cy.get('[data-testid="goldenQaParsed"]').should('be.visible');

    cy.get('[data-testid="ok-button"]').click();

    cy.wait('@CreateGoldenQa');
    cy.contains('Golden Q&A added').should('be.visible');
  });

  it('refuses a name the server would not take', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();
    cy.get('[data-testid="goldenQaFileInput"]').selectFile('cypress/fixtures/golden-qa.csv', {
      force: true,
    });

    cy.get('[data-testid="goldenQaNameInput"]').clear().type('Maternal Health!');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="goldenQaNameError"]').should('contain', 'lowercase letters');
  });
});

describe('reading a Golden Q&A set', () => {
  const openSet = () => {
    openAssistant();
    openTab('evaluation');
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="manageGoldenQaSet"]').first().click();
    return cy.get('[data-testid="viewGoldenQaSetDialog"]').should('be.visible');
  };

  it('reads the stored file back into a table', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', {
      body: 'question,answer\nWhen is the first check-up?,In the first trimester.\nHow much iron?,One a day.',
    });

    openSet();

    cy.get('[data-testid="goldenQaViewSummary"]').should('contain', 'maternal_health_core');
    cy.get('[data-testid="goldenQaViewTable"]').should('be.visible');
    cy.get('[data-testid="goldenQaViewRow"]').should('have.length', 2);
    cy.get('[data-testid="goldenQaViewRow"]').first().should('contain', 'In the first trimester.');

    // the server only takes question and answer, so a set never has a category column to show
    cy.get('[data-testid="goldenQaViewCategories"]').should('be.empty');
    cy.contains('th', 'Category').should('not.exist');
  });

  it('offers the export when the file cannot be read back', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', { statusCode: 403, body: '' });

    openSet();

    cy.get('[data-testid="goldenQaViewFallback"]').should('be.visible');
    cy.get('[data-testid="goldenQaViewFailureReason"]').should('contain', 'could not be read');
    cy.get('[data-testid="goldenQaViewDownloadButton"]').should('be.visible');
    // the count the server took at upload still stands in for the rows
    cy.get('[data-testid="goldenQaViewSummary"]').should('contain', '120 questions');
  });

  it('goes back to the list it was opened from', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', { body: 'question,answer\nQ1,A1' });

    openSet();
    cy.get('[data-testid="middle-button"]').click();

    cy.get('[data-testid="manageGoldenQaSetsDialog"]').should('be.visible');
    cy.get('[data-testid="goldenQaSetList"]').should('be.visible');
  });
});

describe('a Golden Q&A file that cannot be used', () => {
  it('refuses a CSV with no questions in it', () => {
    openAssistant();
    openTab('evaluation');
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();

    cy.get('[data-testid="goldenQaFileInput"]').selectFile(
      { contents: Cypress.Buffer.from('question,answer\n'), fileName: 'empty.csv' },
      { force: true }
    );

    cy.get('[data-testid="goldenQaFileError"]').should('contain', 'No questions found');
    cy.get('[data-testid="goldenQaParsed"]').should('not.exist');
  });
});
