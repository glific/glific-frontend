describe('Staff Management', () => {
  const collectionName = 'Sample Collection ' + +new Date();

  beforeEach(function () {
    // login before each test

    cy.login();
    cy.visit('/staff-management');
    cy.wait(500);
  });

  it('should create new collection', () => {
    cy.create_collection(collectionName);
  });

  it('should load staff management list', () => {
    cy.get('[data-testid="listHeader"]').should('contain', 'Staff Management');
  });

  // commenting this case as we need to more refined test case where we also revert the role
  // it("should change role of staff", () => {
  //   cy.get('[data-testid="EditIcon"]').last().click();
  //   cy.get('[title="Open"]').first().click();
  //   cy.get(".MuiAutocomplete-option").last().click();
  //   cy.get('[data-testid="submitActionButton"]').click();
  //   cy.contains("User edited successfully!");
  // });

  it('should assign collection to staff', () => {
    cy.get('[data-testid="EditIcon"]').last().click({ force: true });
    cy.get('[title="Open"]').last().click();
    cy.get('.MuiAutocomplete-option').contains(collectionName).children().click();
    cy.get('[title="Close"]').last().click();
    cy.get('[data-testid="submitActionButton"]').click({ force: true });
    cy.contains('User edited successfully!');
  });

  it('should remove collection from staff', () => {
    cy.get('[data-testid="EditIcon"]').last().click({ force: true });
    cy.get('[data-testid="searchChip"]')
      .contains(collectionName)
      .parent()
      .within(() => {
        cy.get('[data-testid="deleteIcon"]').click();
      });
    cy.get('[data-testid="submitActionButton"]').click({ force: true });
    cy.contains('User edited successfully!');
  });

  it('should have table column', () => {
    cy.get('th').should('contain', 'Name');
    cy.get('th').should('contain', 'Phone number');
    cy.get('th').should('contain', 'Collections assigned');
    cy.get('th').should('contain', 'Actions');
  });

  it('should redirect to chat screen', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type('NGO Admin' + '{enter}');
    cy.get('[data-testid=additionalButton]').click();
    cy.get('[data-testid=beneficiaryName]').should('contain', 'NGO Admin');
  });

  it('should redirect to edit screen', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type('NGO Admin' + '{enter}');

    cy.get('[data-testid=EditIcon]').click().wait(1000);
    cy.get('[data-testid="heading"]').should('contain', 'Edit User');
  });

  it('should save edit screen', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type('NGO Admin' + '{enter}');

    cy.get('[data-testid=EditIcon]').click({ force: true });
    cy.wait(1000);
    cy.get('[data-testid=submitActionButton]').click({ force: true });
    cy.wait(500);
    cy.get('div').should('contain', 'User edited successfully!');
  });

  it('should have require field', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type('NGO Admin' + '{enter}');

    cy.get('[data-testid=EditIcon]').click({ force: true });
    cy.wait(1000);
    cy.get('[type="text"]').first().clear();
    cy.get('[data-testid=submitActionButton]').click({ force: true });
    cy.get('p').should('contain', 'Name is required.');
  });

  it('should redirect to staff management page', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type('NGO Admin' + '{enter}');

    cy.get('[data-testid=EditIcon]').click({ force: true }).wait(500);
    cy.get('[data-testid=cancelActionButton]').click();
    cy.wait(1000);
    cy.get('[data-testid=listHeader]').should('contain', 'Staff Management');
  });

  it('should delete collection', () => {
    cy.delete_collection(collectionName);
  });
});
