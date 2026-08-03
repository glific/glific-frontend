describe('Searches', () => {
  const search = 'test ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/search');
  });

  it('should load Search list', () => {
    cy.get('[data-testid="listHeader"]').should('contain', 'Searches');
  });

  it('should check require field validation', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.get('[data-testid=submitActionButton]').click();
    cy.contains("Label: can't be blank");
  });

  it('should create new Search', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.get('[data-testid=outlinedInput]').eq(0).click().type(search);
    cy.get('[data-testid=outlinedInput]').eq(1).click().type(search).wait(500);
    cy.get('[data-testid="AutocompleteInput"]').first().click({ force: true }).click();
    cy.get('.MuiAutocomplete-option').first().click();
    cy.get('[data-testid="AutocompleteInput"]')
      .eq(1)
      .click({ force: true })
      .wait(500)
      .type('Group');
    cy.get('.MuiAutocomplete-option').first().click();
    cy.get('[data-testid="AutocompleteInput"]')
      .eq(2)
      .click({ force: true })
      .wait(500)
      .type('NGO Main Account');
    cy.get('.MuiAutocomplete-option').first().click();

    cy.get('[data-testid="date-picker-inline"]').eq(0).click();
    cy.get('button.MuiPickersDay-root').last().click();
    cy.get('[data-testid="date-picker-inline"]').eq(1).click();
    cy.get('button[title="Next month"]').first().click();
    cy.get('button.MuiPickersDay-root').first().click();

    cy.get('[data-testid="submitActionButton"]').click({ force: true });
    cy.get('div').should('contain', 'Search created successfully!');
  });

  it('should edit search', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type(search + '{enter}');
    cy.get('[data-testid=EditIcon]').click();
    cy.wait(1000);
    cy.get('[data-testid="submitActionButton"]').click({ force: true });
    cy.wait(500);
    cy.get('div').should('contain', 'Search edited successfully!');
  });

  it('should delete search', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type(search + '{enter}');
    cy.get('[data-testid=DeleteIcon]').click();
    cy.get('[data-testid="ok-button"]').click({ force: true });
    cy.wait(500);
    cy.get('div').should('contain', 'Search deleted successfully');
  });
});
