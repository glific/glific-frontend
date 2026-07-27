describe('Role - Staff - Collection', () => {
  const collectionName = 'Restricted Group';

  beforeEach(function () {
    cy.env(['staff']).then(({ staff }) => {
      cy.appLogin(staff.phone, staff.password);
      cy.visit('/collection');
    });
  });

  it('should add member to collection', () => {
    cy.get('input[name=searchInput]').type(collectionName + '{enter}');
    cy.get('[data-testid=additionalButton]').eq(0).click();
    cy.get('[data-testid=AutocompleteInput]').click();
    cy.get('input[type=checkbox]')
      .first()
      .then(($checkbox) => {
        if ($checkbox.is(':checked')) {
          cy.get('[data-testid="AutocompleteInput"] [data-testid="ArrowDropDownIcon"]')
            .click()
            .wait(500);
          cy.get('[data-testid="ok-button"]').click();
        } else {
          cy.wrap($checkbox).click();
          cy.get('[data-testid="AutocompleteInput"] [data-testid="ArrowDropDownIcon"]')
            .click()
            .wait(500);
          cy.get('[data-testid="ok-button"]').click();
          cy.get('div').should('contain', '1 contact added');
        }
      });
  });

  it('should remove member from collection', () => {
    cy.get('input[name=searchInput]').type(collectionName + '{enter}');
    cy.get('[data-testid=view]').click();
    cy.wait(1000);
    cy.get('[type="checkbox"]').first().check();
    if (cy.get('[data-testid="deleteBtn"]')) {
      cy.get('[data-testid="deleteBtn"]').first().click();
      cy.get('[data-testid="ok-button"]').click();
      cy.get('div').should('contain', 'Contact has been removed successfully from the collection.');
    }
  });
});
