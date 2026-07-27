describe('File search', () => {
  const assistantName = `Test Assistant ${+new Date()}`;
  const updatedName = `${assistantName} Updated`;

  beforeEach(function () {
    cy.login();
    cy.visit('/assistants');
    cy.get('[data-testid="headerTitle"]', { timeout: 10000 }).should('contain', 'Assistants');
  });

  it('should open the create form with all fields when clicking Create button', () => {
    cy.get('[data-testid="headingButton"]').click();
    cy.get('[data-testid="createAssistantContainer"]').should('be.visible');
    cy.contains('Name*').should('be.visible');
    cy.contains('Model*').should('be.visible');
    cy.contains('Instructions (Prompt)*').should('be.visible');
    cy.contains('Knowledge Base Files *').should('be.visible');
    cy.contains('Temperature').should('be.visible');
    cy.contains('Notes (Optional)').scrollIntoView().should('be.visible');
  });

  it('should display form helper texts in create mode', () => {
    cy.get('[data-testid="headingButton"]').click();
    cy.contains('Give a recognizable name for your assistant').should('exist');
    cy.contains('Choose the best model for your needs.').should('exist');
    cy.contains('Set the instructions according to your requirements.')
      .scrollIntoView()
      .should('be.visible');
    cy.contains('Add notes on changes made to this assistant')
      .scrollIntoView()
      .should('be.visible');
  });

  it('should create a new assistant with file upload', () => {
    cy.get('[data-testid="headingButton"]').click();
    cy.wait(500);

    cy.get('input[name="name"]').type(assistantName);
    cy.get('[data-testid="AutocompleteInput"]').first().find('input').click();
    cy.get('.MuiAutocomplete-option').first().click();

    cy.get('textarea[name="instructions"]')
      .first()
      .type('You are a helpful test assistant for automated e2e testing.');

    cy.get('[data-testid="addFiles"]').click();
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Manage Files');
    cy.get('[data-testid="uploadFile"]').selectFile('cypress/fixtures/sample.md', {
      force: true,
    });
    cy.get('[data-testid="fileItem"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="attachedIcon"]', { timeout: 5000 }).should('exist');

    cy.get('[data-testid="ok-button"]').click();
    cy.contains("Knowledge base creation in progress, will notify once it's done").should(
      'be.visible'
    );
    cy.get('[data-testid="submitAction"]').click();
    cy.contains('Assistant created successfully', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="versionInProgress"]').should('be.visible');

    cy.get('[data-testid="listItem"]')
      .first()
      .within(() => {
        cy.get('[data-testid="assistantStatus"] span').should('have.text', 'In Progress');
      });
  });

  it('should ensure assistant status changes to ready', () => {
    const maxTries = 12; // 60 seconds / 5 seconds
    let tryCount = 0;

    function checkStatusOrRetry() {
      cy.get('[data-testid="listItem"]', { timeout: 20000 })
        .first()
        .find('[data-testid="assistantStatus"] span')
        .invoke('text')
        .then((statusText) => {
          const status = statusText.trim();
          cy.log('Status: ' + status);

          if (status === 'Ready') {
            cy.log('Assistant status is Ready');
          } else if (++tryCount >= maxTries) {
            throw new Error('Assistant status never became Ready');
          } else {
            cy.log('Reloading and retrying...');
            cy.reload();
            cy.wait(5000);
            checkStatusOrRetry();
          }
        });
    }

    return checkStatusOrRetry();
  });

  it('should display assistants in the list', () => {
    cy.get('[data-testid="listItem"]').should('have.length.greaterThan', 0);
    cy.contains(assistantName).should('be.visible');
  });

  it('should search for the created assistant by name', () => {
    cy.get('input[placeholder="Search"]').type(assistantName);
    cy.get('[data-testid="listItem"]').should('have.length.greaterThan', 0);
    cy.contains(assistantName).should('be.visible');
  });

  it('should show empty state for non-existent search term', () => {
    cy.get('input[placeholder="Search"]').type('NonExistentAssistant_XYZ_99999');
    cy.contains('No assistants found!').should('be.visible');
  });

  it('should clear search and restore the full list', () => {
    cy.get('input[placeholder="Search"]').type('SomeSearchTerm');
    cy.wait(500);
    cy.get('[data-testid="CloseIcon"]').click();
    cy.get('[data-testid="listItem"]').should('have.length.greaterThan', 0);
  });

  it('should copy assistant item ID from the list', () => {
    cy.get('[data-testid="listItem"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="copyItemId"]').first().click({ force: true });
  });

  it('should select an assistant and display its details in the form', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="createAssistantContainer"]').should('be.visible');
    cy.get('input[name="name"]').should('not.have.value', '');
  });

  it('should display knowledge base details for the selected assistant', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.contains(/\d+ files?/).should('be.visible');
  });

  it('should copy assistant ID from the edit form', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="copyCurrentAssistantId"]').click();
  });

  it('should show unsaved changes indicator when name is modified', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('input[name="name"]').type(' modified');
    cy.get('[data-testid="unsavedIndicator"]').should('be.visible');
    cy.contains('Unsaved changes').should('be.visible');
  });

  it('should show unsaved changes indicator when temperature is modified', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('input[name="sliderDisplay"]').clear().type('0.5');
    cy.get('[data-testid="unsavedIndicator"]').should('be.visible');
  });

  it('should update the assistant name and save', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('input[name="name"]').clear().type(updatedName);
    cy.get('[data-testid="submitAction"]').click();
    cy.contains('Changes saved successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should edit instructions in the expanded dialog and save', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="expandIcon"]').click();
    cy.get('textarea[name="expand-instructions"]')
      .clear()
      .type('Updated instructions from e2e test');
    cy.get('[data-testid="save-button"]').click();
    cy.get('textarea[name="instructions"]').should(
      'have.value',
      'Updated instructions from e2e test'
    );
  });

  it('should show existing files when opening file dialog for the assistant', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="addFiles"]').click();
    cy.get('[data-testid="fileItem"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="cancel-button"]').click();
  });

  it('should disable OK button when all files are removed from the dialog', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="addFiles"]').click();
    cy.get('[data-testid="fileItem"]').should('have.length.greaterThan', 0);

    cy.get('[data-testid="deleteFile"]').each(($btn) => {
      cy.wrap($btn).click();
    });

    cy.get('[data-testid="ok-button"]').should('be.disabled');
    cy.get('[data-testid="cancel-button"]').click();
  });

  it('should revert files when canceling the dialog after deleting files', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="addFiles"]').click();

    cy.get('[data-testid="fileItem"]')
      .its('length')
      .then((originalCount) => {
        cy.get('[data-testid="deleteFile"]').first().click();
        cy.get('[data-testid="cancel-button"]').click();

        // Reopen dialog - files should be restored
        cy.get('[data-testid="addFiles"]').click();
        cy.get('[data-testid="fileItem"]').should('have.length', originalCount);
        cy.get('[data-testid="cancel-button"]').click();
      });
  });

  it('should show delete confirmation dialog with warning text and allow canceling', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="removeAssistant"]').click();
    cy.contains('Are you sure you want to delete').should('be.visible');
    cy.contains(
      'Please confirm that this assistant is not being used in any of the active flows.'
    ).should('be.visible');
    cy.get('[data-testid="cancel-button"]').click();
  });

  it('should delete the assistant and show success notification', () => {
    cy.get('[data-testid="listItem"]').first().click();
    cy.get('[data-testid="removeAssistant"]').click();
    cy.get('[data-testid="ok-button"]').click();
    cy.contains('deleted successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should show empty search after assistant is deleted', () => {
    cy.get('input[placeholder="Search"]').type(updatedName);
    cy.contains('No assistants found!').should('be.visible');
  });
});
