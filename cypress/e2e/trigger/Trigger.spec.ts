export const selectFromInput = (elementPosition, optionPosition) => {
  cy.get('[data-testid="AutocompleteInput"]').eq(elementPosition).click().wait(500);
  cy.get('.MuiAutocomplete-option').eq(optionPosition).click();
};

import * as dayjs from 'dayjs';

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

    cy.get('[data-testid="date-picker-inline"]').eq(0).click();

    cy.get('button[title="Next month"]').first().click();

    cy.get('button.MuiPickersDay-root').last().click();

    cy.get('[data-testid="date-picker-inline"]').eq(1).click();

    cy.get('button[title="Next month"]').first().click();
    cy.get('button[title="Next month"]').first().click();
    cy.get('button[title="Next month"]').first().click();

    cy.get('button.MuiPickersDay-root').first().click();

    //select start time
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
