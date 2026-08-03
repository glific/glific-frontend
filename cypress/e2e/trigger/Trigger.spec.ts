export const selectFromInput = (elementPosition, optionPosition) => {
  cy.get('[data-testid="AutocompleteInput"]').eq(elementPosition).click().wait(500);
  cy.get('.MuiAutocomplete-option').eq(optionPosition).click();
};

const typeDate = (wrapperIndex: number, date: Date) => {
  const wrapper = () => cy.get('[data-testid="date-picker-inline"]').eq(wrapperIndex);

  wrapper()
    .find('[aria-label="Month"]')
    .click()
    .type(String(date.getMonth() + 1).padStart(2, '0'));
  wrapper().find('[aria-label="Day"]').type(String(date.getDate()).padStart(2, '0'));
  wrapper().find('[aria-label="Year"]').type(String(date.getFullYear()));
};

describe('Triggers (daily) ', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/trigger');
  });

  it('should create new trigger', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(500);

    // select first flow from list
    selectFromInput(0, 0);

    // start date: tomorrow, so it's always ahead of "now" regardless of what time gets picked
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    typeDate(0, startDate);

    // end date: well after the start date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 60);
    typeDate(1, endDate);

    cy.get('[data-testid="time-picker"]').eq(0).click();
    cy.get('li[role="option"]').first().click();

    // select repeat as (does not repeat)
    selectFromInput(1, 0);

    // select the first collection
    selectFromInput(3, 0);

    // save trigger
    cy.get('[data-testid="submitActionButton"]').click({ force: true });
    cy.get('div').should('contain', 'Trigger created successfully!');
  });
});
