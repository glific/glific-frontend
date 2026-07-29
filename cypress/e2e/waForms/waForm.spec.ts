const FORM_DEFINITION =
  '{"version":"7.2","screens":[{"title":"Page 1 of 2","layout":{"type":"SingleColumnLayout","children":[{"type":"Form","name":"flow_path","children":[{"type":"TextSubheading","text":"Sample form"}]}]}}]}';

describe('Whatsapp Forms', () => {
  beforeEach(() => {
    cy.login();

    // Mock API responses for create operation
    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'CreateWhatsappForm') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              createWhatsappForm: {
                __typename: 'WhatsappFormResult',
                whatsappForm: {
                  __typename: 'WhatsappForm',
                  id: '2',
                  name: req.body.variables.input.name,
                },
                errors: null,
              },
            },
          },
        });
      }
    }).as('createWhatsappForm');

    // Mock API responses for list operation
    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'listWhatsappForms') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              whatsappForms: [
                {
                  __typename: 'WhatsappForm',
                  id: '1',
                  name: 'first form',
                  description: 'first form description',
                  status: 'DRAFT',
                  revision: {
                    definition: FORM_DEFINITION,
                  },
                  categories: ['other'],
                },
                {
                  __typename: 'WhatsappForm',
                  id: '2',
                  name: 'second form',
                  description: 'second form description',
                  status: 'PUBLISHED',
                  categories: ['lead_generation'],
                  revision: {
                    definition: FORM_DEFINITION,
                  },
                },
                {
                  __typename: 'WhatsappForm',
                  id: '3',
                  name: 'third form',
                  description: 'third form description',
                  status: 'INACTIVE',
                  categories: ['lead_generation'],
                  revision: {
                    definition: FORM_DEFINITION,
                  },
                },
              ],
            },
          },
        });
      }
    }).as('listWhatsappForms');

    // Mock API responses for get single form operation (for edit)
    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'WhatsappForm') {
        const formId = req.body.variables.id;
        const status = formId === '2' ? 'PUBLISHED' : 'DRAFT';
        req.reply({
          statusCode: 200,
          body: {
            data: {
              whatsappForm: {
                __typename: 'WhatsappFormResult',
                whatsappForm: {
                  __typename: 'WhatsappForm',
                  id: req.body.variables.id,
                  name: 'first form',
                  description: 'first form description',
                  revision: {
                    definition: FORM_DEFINITION,
                  },
                  categories: ['survey'],
                  status: status,
                  metaFlowId: '869324785433064',
                  insertedAt: '2025-11-21 10:59:02.415115Z',
                  updatedAt: '2025-11-21 10:59:17.506001Z',
                },
              },
            },
          },
        });
      }
    }).as('getWhatsappForm');

    // Mock API responses for update operation
    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'UpdateWhatsappForm') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              updateWhatsappForm: {
                __typename: 'WhatsappFormResult',
                whatsappForm: {
                  __typename: 'WhatsappForm',
                  id: req.body.variables.id || '2',
                  name: req.body.variables.input.name,
                },
                errors: null,
              },
            },
          },
        });
      }
    }).as('updateWhatsappForm');

    // Mock API responses for delete, publish, deactivate, activate operations
    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'DeactivateWhatsappForm') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              deactivateWhatsappForm: {
                __typename: 'WhatsappFormResult',
                whatsappForm: {
                  __typename: 'WhatsappForm',
                  id: req.body.variables.id,
                  status: 'INACTIVE',
                },
                errors: null,
              },
            },
          },
        });
      }
    }).as('deactivateWhatsappForm');

    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'ActivateWhatsappForm') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              activateWhatsappForm: {
                __typename: 'WhatsappFormResult',
                whatsappForm: {
                  __typename: 'WhatsappForm',
                  id: req.body.variables.activateWhatsappFormId,
                  status: 'DRAFT',
                },
                errors: null,
              },
            },
          },
        });
      }
    }).as('activateWhatsappForm');

    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'PublishWhatsappForm') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              publishWhatsappForm: {
                __typename: 'WhatsappFormResult',
                whatsappForm: {
                  __typename: 'WhatsappForm',
                  id: req.body.variables.id,
                  status: 'PUBLISHED',
                },
                errors: null,
              },
            },
          },
        });
      }
    }).as('publishWhatsappForm');

    cy.intercept('POST', '**/api', (req) => {
      if (req.body.operationName === 'DeleteWhatsappForm') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              deleteWhatsappForm: {
                __typename: 'WhatsappFormResult',
                whatsappForm: {
                  __typename: 'WhatsappForm',
                  id: req.body.variables.id,
                },
                errors: null,
              },
            },
          },
        });
      }
    }).as('deleteWhatsappForm');

    cy.visit('/whatsapp-forms');
    cy.wait('@listWhatsappForms');
  });

  it('it should open the Whatsapp Forms page', () => {
    cy.get('[data-testid="listHeader"]').should('contain', 'WhatsApp Forms');
  });

  it('should create a new Whatsapp Form', () => {
    const formJson = {
      type: 'form',
      title: 'Sample Form',
      fields: [
        { type: 'text', label: 'Name' },
        { type: 'email', label: 'Email' },
      ],
    };
    cy.get('[data-testid="newItemButton"]').click();

    cy.get('input[name=name]').first().type('Title for Whatsapp Form');
    cy.get('textarea[name=description]').first().type('This is a description for Whatsapp Form.\n');
    cy.get('[data-testid="AutocompleteInput"]').eq(0).click().wait(500);
    cy.get('.MuiAutocomplete-option').eq(0).click().wait(500);

    cy.get('[data-testid="submitActionButton"]').click({ force: true });

    cy.wait('@createWhatsappForm');

    cy.get('div').should('contain', 'Whatsapp Form created successfully!');
  });

  it('should configure an existing Whatsapp Form', () => {
    cy.get('[data-testid="configure-icon"]').first().click();

    cy.wait('@getWhatsappForm');

    cy.get('input[name=name]').first().clear().type('Updated Title for Whatsapp Form');
    cy.get('textarea[name=description]')
      .first()
      .clear()
      .type('This is an updated description for Whatsapp Form.\n');

    cy.get('[data-testid="submitActionButton"]').click({ force: true });

    cy.wait('@updateWhatsappForm');

    cy.get('div').should('contain', 'Whatsapp Form edited successfully!');
  });

  it('should make a form inactive', () => {
    cy.get('[data-testid="deactivate-icon"]').eq(0).click();
    cy.wait('@deactivateWhatsappForm');

    cy.get('[data-testid="ok-button"]').click({ force: true });

    cy.get('div').should('contain', 'Form deactivated successfully');
  });

  it('should make a form active', () => {
    cy.get('[data-testid="activate-icon"]').eq(0).click();
    cy.wait('@activateWhatsappForm');

    cy.get('div').should('contain', 'Form activated successfully');
  });

  it('should delete a Whatsapp Form', () => {
    cy.get('[data-testid="DeleteIcon"]').first().click();
    cy.wait('@deleteWhatsappForm');

    cy.get('[data-testid="ok-button"]').click({ force: true });

    cy.get('div').should('contain', 'Form deleted successfully');
  });
});
