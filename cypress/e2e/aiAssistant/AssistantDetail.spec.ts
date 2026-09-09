import { BELOW_STICKY_HEADER, V2_SERVICES, loginWithServices } from '../../utils/assistant-flow';
import {
  ASSISTANT_ID,
  BUILDING_VERSIONS,
  DETAIL_PATH,
  DRAFT_PROMPT,
  FAILED_VERSIONS,
  LIVE_PROMPT,
  NO_PARAM_MODELS,
} from '../../utils/assistant-fixtures';
import {
  editPrompt,
  openAssistant,
  openAssistantPage,
  openTab,
  selectVersion,
  stubAssistantApi,
} from '../../utils/assistant-detail';

describe('the assistant page', () => {
  beforeEach(() => {
    openAssistant();
  });

  it('opens on the live version, with the assistant it belongs to', () => {
    cy.get('[data-testid="headerTitle"]').should('contain', 'Maternal Health Bot');
    cy.get('[data-testid="assistantId"]').should('contain', 'asst_700000000000');
    cy.get('[data-testid="liveNote"]').should('contain', 'Version 2.0 is live');
    cy.get('[data-testid="tab-persona"]').should('have.attr', 'aria-selected', 'true');
  });

  it('renames the assistant', () => {
    cy.get('[data-testid="editNameButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="nameInput"]').clear().type('ANC Companion');
    cy.get('[data-testid="saveNameButton"]').click();

    cy.wait('@UpdateAssistant').then((interception) => {
      expect(interception.request.body.variables?.input?.name).to.eq('ANC Companion');
    });
  });

  it('leaves the name alone when the edit is cancelled', () => {
    cy.get('[data-testid="editNameButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="nameInput"]').clear().type('Something else');
    cy.get('[data-testid="cancelNameButton"]').click();

    cy.get('[data-testid="headerTitle"]').should('contain', 'Maternal Health Bot');
  });

  it('lists every version, with the live one marked and the last score beside it', () => {
    cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="versionOption-2.0"]')
      .find('[data-testid="livePill"]')
      .should('contain', 'LIVE');
    cy.get('[data-testid="versionHealth-2.0"]').should('contain', 'Good 4.32');
    cy.get('[data-testid="versionOption-2.1"]').should('not.contain', 'LIVE');
  });

  it('loads the prompt of the version that is picked', () => {
    selectVersion('2.1');

    cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.1');
    cy.get('[data-testid="promptInput"]').should('have.value', DRAFT_PROMPT);
  });
});

describe('an assistant with no version saved', () => {
  it('says there is nothing published yet', () => {
    openAssistantPage({ versions: [] });
    cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-testid="noVersionPill"]').should('contain', 'No version saved yet');
    cy.get('[data-testid="liveNote"]').should('contain', 'Nothing published yet');
    cy.get('[data-testid="versionPill"]').should('not.exist');
  });
});

describe('versions that are not ready', () => {
  it('says a version is still being built, and will not test or publish it', () => {
    openAssistant({ versions: BUILDING_VERSIONS });
    selectVersion('2.1');

    cy.get('[data-testid="inProgressPill-2.1"]').should('be.visible');
    cy.get('[data-testid="publishButton"]').should('be.disabled');
    cy.get('[data-testid="liveNote"]').should('contain', 'This version is still being prepared');

    openTab('tryItOut');
    cy.get('[data-testid="tryItOutBlocker"]').should(
      'contain',
      'This version is still being prepared'
    );
  });

  it('says a version failed to build, and offers the way back', () => {
    openAssistant({ versions: FAILED_VERSIONS });
    selectVersion('2.1');

    cy.get('[data-testid="failedPill-2.1"]').should('be.visible');
    cy.get('[data-testid="publishButton"]').should('be.disabled');

    openTab('tryItOut');
    cy.get('[data-testid="tryItOutBlocker"]').should('contain', 'This version failed to build');
    cy.get('[data-testid="tabPanel-tryItOut"]')
      .find('[data-testid="goToPersonaButton"]')
      .should('be.visible');
  });

  it('switches version once the reader confirms, leaving the edit behind', () => {
    openAssistant();
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="versionOption-2.1"]').click();
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Switch version?');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.1');
    cy.get('[data-testid="promptInput"]').should('have.value', DRAFT_PROMPT);
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });
});

describe('editing on the Model & Prompt tab', () => {
  beforeEach(() => {
    openAssistant();
  });

  it('flags an edited prompt as unsaved', () => {
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="tabDirtyDot-persona"]').should('be.visible');
    cy.get('[data-testid="saveVersionButton"]').should('be.enabled');
    cy.get('[data-testid="discardButton"]').should('be.visible');
  });

  it('puts the saved prompt back when the edit is discarded', () => {
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="discardButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Discard unsaved changes?');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="promptInput"]').should('have.value', LIVE_PROMPT);
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });

  it('saves the prompt and model as a new version', () => {
    editPrompt('Answer in two sentences.');
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@UpdateAssistant').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(interception.request.body.variables?.updateAssistantId).to.eq(ASSISTANT_ID);
      expect(input.instructions).to.eq('Answer in two sentences.');
      expect(input.model).to.eq('gpt-4.1');
      expect(input.name).to.eq('Maternal Health Bot');
    });
    cy.contains('Changes saved successfully').should('be.visible');
  });

  it('counts a changed temperature as an edit', () => {
    cy.get('[data-testid="temperatureSlider"]').should('be.visible');
    cy.get('[data-testid="temperatureInput"]').clear().type('0.4');

    cy.get('[data-testid="unsavedChanges"]').should('be.visible');
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@UpdateAssistant').then((interception) => {
      expect(interception.request.body.variables?.input?.temperature).to.eq(0.4);
    });
  });

  it('swaps in the settings of a model that takes an effort instead', () => {
    cy.get('[data-testid="modelSelect"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="modelOption-o3-mini"]').click();

    cy.get('[data-testid="effortSegment"]').should('be.visible');
    cy.get('[data-testid="temperatureInput"]').should('not.exist');
    // the reader is told why the temperature disappeared
    cy.contains('This model does not take a temperature').should('be.visible');
  });

  it('asks before switching version with the edit unsaved', () => {
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="versionOption-2.1"]').click();

    cy.get('[data-testid="dialogTitle"]').should('contain', 'Switch version?');
    cy.get('[data-testid="cancel-button"]').click();

    // the edit survives, and so does the version it was made on
    cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.0');
    cy.get('[data-testid="promptInput"]').should('have.value', 'Answer in two sentences.');
  });
});

describe('more of the Model & Prompt tab', () => {
  it('closes the expanded editor without touching the prompt', () => {
    openAssistant();

    cy.get('[data-testid="expandPromptButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="promptExpandedInput"]').clear().type('Something else entirely.');
    cy.get('[data-testid="cancel-button"]').click();

    cy.get('[data-testid="promptInput"]').should('have.value', LIVE_PROMPT);
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });

  it('saves the reasoning effort of a model that takes one', () => {
    openAssistant();

    cy.get('[data-testid="modelSelect"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="modelOption-o3-mini"]').click();
    cy.get('[data-testid="effortSegment-high"]').click();

    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@UpdateAssistant').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(input.model).to.eq('o3-mini');
      expect(input.effort).to.eq('high');
      // the model takes no temperature, so none is sent
      expect(input.temperature).to.eq(undefined);
    });
  });

  it('opens the prompt builder when the organisation has it', () => {
    loginWithServices({ ...V2_SERVICES, promptGeneratorEnabled: true });
    stubAssistantApi();
    cy.visit(DETAIL_PATH);
    cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-testid="generateWithAiButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="betaBanner"]').should('be.visible');
    cy.get('[data-testid="generatePromptButton"]').should('be.visible');
  });
});

describe('a model with nothing to tune', () => {
  it('says when a model has nothing to tune', () => {
    openAssistant({ models: NO_PARAM_MODELS });

    cy.get('[data-testid="noModelParams"]').should('contain', 'no settings to tune');
    cy.get('[data-testid="temperatureInput"]').should('not.exist');
  });
});
