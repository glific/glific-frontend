import { BELOW_STICKY_HEADER } from '../../utils/assistant-flow';
import {
  FILE_DOWNLOAD_PATH,
  LEGACY_KNOWLEDGE_BASE,
  LEGACY_VERSIONS,
} from '../../utils/assistant-fixtures';
import { openAssistant, openTab } from '../../utils/assistant-detail';

describe('the Knowledge Base tab of a saved assistant', () => {
  beforeEach(() => {
    openAssistant();
    openTab('knowledgeBase');
  });

  it('lists what the version already has attached', () => {
    cy.get('[data-testid="fileCount"]').should('contain', '1 file attached');
    cy.get('[data-testid="knowledgeBaseFile"]').should('contain', 'anc-guide.pdf');
    cy.get('[data-testid="addFilesButton"]').should('be.enabled');
  });

  it('shows the knowledge base id behind the technical details', () => {
    cy.get('[data-testid="technicalDetailsToggle"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="vectorStoreId"]').should('contain', 'vs_maternal_health');
    cy.get('[data-testid="noVectorStore"]').should('not.exist');
  });

  it('asks the server for a link when a file is downloaded', () => {
    cy.intercept('GET', `**${FILE_DOWNLOAD_PATH}`, { body: 'the file' }).as('fileDownload');

    cy.get('[data-testid="downloadFileButton"]').first().click(BELOW_STICKY_HEADER);

    cy.wait('@GetFile').then((interception) => {
      expect(interception.request.body.variables?.fileId).to.eq('file-1');
    });
    cy.wait('@fileDownload');
  });

  it('saves an added file as a new knowledge base version', () => {
    cy.get('[data-testid="fileInput"]').selectFile('cypress/fixtures/sample.md', { force: true });
    cy.wait('@uploadFile');

    cy.get('[data-testid="knowledgeBaseFile"]').should('have.length', 2);
    cy.get('[data-testid="tabDirtyDot-knowledgeBase"]').should('be.visible');

    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    // the files go to the knowledge base first, and the version then points at it
    cy.wait('@CreateKnowledgeBase').then((interception) => {
      expect(interception.request.body.variables?.createKnowledgeBaseId).to.eq('kb-1');
      expect(interception.request.body.variables?.mediaInfo).to.have.length(2);
    });
    cy.wait('@UpdateAssistant').then((interception) => {
      expect(interception.request.body.variables?.input?.knowledgeBaseVersionId).to.eq('kbv-2');
    });
  });

  it('keeps a file that the reader decides not to remove', () => {
    cy.get('[data-testid="removeFileButton"]').first().click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="dialogTitle"]').should('contain', 'Remove anc-guide.pdf?');
    cy.get('[data-testid="cancel-button"]').click();

    cy.get('[data-testid="knowledgeBaseFile"]').should('contain', 'anc-guide.pdf');
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });
});

describe('a legacy knowledge base', () => {
  beforeEach(() => {
    openAssistant({ vectorStore: LEGACY_KNOWLEDGE_BASE, versions: LEGACY_VERSIONS });
    openTab('knowledgeBase');
  });

  it('is read-only, and says why', () => {
    cy.get('[data-testid="legacyNotice"]').should(
      'contain',
      'created before the knowledge base rewrite'
    );
    cy.get('[data-testid="legacyKnowledgeBaseInfo"]').should('be.visible');
    cy.get('[data-testid="addFilesButton"]').should('be.disabled');
  });

  it('offers neither download nor removal of its files', () => {
    cy.get('[data-testid="downloadFileButton"]').should('not.exist');
    cy.get('[data-testid="removeFileButton"]').should('not.exist');
    cy.get('[data-testid="supportedFormats"]').should('not.exist');
  });
});

describe('attaching files to the knowledge base', () => {
  it('refuses a file bigger than the limit', () => {
    openAssistant();
    openTab('knowledgeBase');

    cy.get('[data-testid="fileInput"]').selectFile(
      { contents: Cypress.Buffer.alloc(21 * 1024 * 1024), fileName: 'huge.pdf' },
      { force: true }
    );

    cy.contains('is larger than').should('be.visible');
    cy.get('[data-testid="knowledgeBaseFile"]').should('have.length', 1);
  });

  it('shows a file while it is still uploading', () => {
    openAssistant({ uploadDelay: 1500 });
    openTab('knowledgeBase');

    cy.get('[data-testid="fileInput"]').selectFile('cypress/fixtures/sample.md', { force: true });

    cy.get('[data-testid="uploadingFile"]').should('be.visible');
    cy.get('[data-testid="fileCount"]').should('contain', 'processing');

    cy.get('[data-testid="knowledgeBaseFile"]', { timeout: 10000 }).should('have.length', 2);
    cy.get('[data-testid="uploadingFile"]').should('not.exist');
  });

  it('removes a file once the reader confirms', () => {
    openAssistant();
    openTab('knowledgeBase');

    cy.get('[data-testid="removeFileButton"]').first().click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="knowledgeBaseEmpty"]').should('be.visible');
    cy.get('[data-testid="fileCount"]').should('contain', '0 files attached');
    // the file only leaves the server when the next version is saved
    cy.get('[data-testid="unsavedChanges"]').should('be.visible');
  });
});

describe('the knowledge base id', () => {
  it('copies the knowledge base id', () => {
    openAssistant();
    openTab('knowledgeBase');

    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('copy').resolves();
    });

    cy.get('[data-testid="technicalDetailsToggle"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="copyVectorStoreId"]').click();

    cy.get('@copy').should('have.been.calledWith', 'vs_maternal_health');
  });
});
