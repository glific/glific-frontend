describe('Other Settings', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/settings');
  });

  it('should have a settings list', () => {
    cy.get('[data-testid="heading"]').should('contain', 'Settings');
  });

  it('should check Gupshup settings', () => {
    cy.get('[data-testid="setting-drawer"]').contains('Gupshup').click();
    cy.wait(500);
    cy.get('input[name=app_name]').then(($input) => {
      const val = $input.val();
      if (val) {
        cy.get('input[name=app_name]').invoke('val').should('not.be.empty');
        cy.get('input[name=api_key]').invoke('val').should('not.be.empty');
      }
    });
  });

  it('should check Gupshup settings validation', () => {
    cy.get('[data-testid="setting-drawer"]').contains('Gupshup').click();
    cy.get('input[name=isActive]').should(($input) => {
      const val = $input.val();
      if (val) {
        cy.get('input[name=app_name]').clear();
        cy.get('input[name=api_key]').clear();
        cy.get('[data-testid="submitActionButton"]').click();
        cy.get('p').should('contain', 'API End Point is required.');
        cy.get('p').should('contain', 'App Name is required.');
        cy.get('p').should('contain', 'API Key is required.');
      }
    });
  });

  it('should check Glifproxy settings', () => {
    cy.get('[data-testid="layout"]').then((body) => {
      if (body.find('[data-testid="glifproxy"]').length) {
        cy.get('[data-testid="glifproxy"]').find('[data-testid="EditIcon"]').click();
        cy.wait(500);
        cy.get('h5').should('contain', 'Edit Settings');
      }
    });
  });

  it('should check Glifproxy settings validation', () => {
    cy.get('[data-testid="layout"]').then((body) => {
      if (body.find('[data-testid="glifproxy"]').length) {
        cy.get('[data-testid="glifproxy"]').find('[data-testid="EditIcon"]').click();
        cy.get('input[name=isActive]').should(($input) => {
          const val = $input.val();
          if (val) {
            cy.get('[data-testid="submitActionButton"]').click();
            cy.get('p').should('contain', 'API End Point is required.');
          }
        });
      }
    });
  });

  it('should check BigQuery settings', () => {
    cy.get('[data-testid="setting-drawer"]').contains('BigQuery').click();
    cy.wait(500);
    cy.get('h5').should('contain', 'BigQuery');
  });

  it('should check BigQuery settings validation', () => {
    cy.get('[data-testid="setting-drawer"]').contains('BigQuery').click();
    cy.get('input[name=isActive]').should(($input) => {
      const val = $input.val();
      if (val) {
        cy.get('[data-testid="submitActionButton"]').click();
        cy.get('p').should('contain', 'API End Point is required.');
      }
    });
  });

  it('should check Chatbase settings', () => {
    cy.get('[data-testid="layout"]').then((body) => {
      if (body.find('[data-testid="chatbase"]').length) {
        cy.get('[data-testid="chatbase"]').find('[data-testid="EditIcon"]').click();
        cy.wait(500);
        cy.get('h5').should('contain', 'Edit Settings');
      }
    });
  });

  it('should check Google Cloud Storage settings', () => {
    cy.get('[data-testid="setting-drawer"]').contains('Google Cloud Storage').click();
    cy.wait(500);
    cy.get('[data-testid="setting-header"]').should('contain', 'Google Cloud Storage');
  });
});
