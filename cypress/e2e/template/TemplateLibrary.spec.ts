const templateLibraryData = [
  {
    elementName: 'account_creation_confirmation_3',
    category: 'UTILITY',
    body: 'Hei, {{1}}\n\nDen nye kontoen din er opprettet.',
    languageCode: 'nb',
    industry: 'E_COMMERCE,FINANCIAL_SERVICES',
    topic: 'ACCOUNT_UPDATES',
    usecase: 'ACCOUNT_CREATION_CONFIRMATION',
    containerMeta: JSON.stringify({
      data: 'Hei, {{1}}\n\nDen nye kontoen din er opprettet.',
      buttons: [{ type: 'URL', text: 'Bekreft konto', url: 'https://www.example.com' }],
      header: 'Fullfør konfigurering av konto',
    }),
  },
  {
    elementName: 'order_confirmation_1',
    category: 'UTILITY',
    body: 'Your order {{1}} has been confirmed.',
    languageCode: 'en',
    industry: 'E_COMMERCE',
    topic: 'ACCOUNT_UPDATES',
    usecase: 'ACCOUNT_CREATION_CONFIRMATION',
    containerMeta: JSON.stringify({ data: 'Your order {{1}} has been confirmed.', buttons: [] }),
  },
  {
    elementName: 'appointment_reminder_1',
    category: 'UTILITY',
    body: 'Your appointment is on {{1}}.',
    languageCode: 'en',
    industry: 'HEALTHCARE',
    topic: 'ALERT_UPDATE',
    usecase: 'APPOINTMENT_REMINDER',
    containerMeta: JSON.stringify({
      data: 'Your appointment is on {{1}}.',
      buttons: [{ type: 'QUICK_REPLY', text: 'Reschedule' }],
    }),
  },
  {
    elementName: 'otp_verification_1',
    category: 'AUTHENTICATION',
    body: 'Your OTP is {{1}}.',
    languageCode: 'en',
    industry: 'FINANCIAL_SERVICES',
    topic: 'ACCOUNT_UPDATES',
    usecase: 'OTP_VERIFICATION',
    containerMeta: JSON.stringify({ data: 'Your OTP is {{1}}.', buttons: [] }),
  },
];

const englishId = '900001';
const norwegianId = '900002';

const libraryActiveLanguages = [
  { __typename: 'Language', id: englishId, label: 'English', localized: 'English', locale: 'en' },
  {
    __typename: 'Language',
    id: norwegianId,
    label: 'Norwegian Bokmål',
    localized: 'Norwegian Bokmål',
    locale: 'nb',
  },
];

const mockUserLanguages = (defaultLanguageId: string = englishId) => {
  cy.intercept('POST', '**/api', (req) => {
    if (req.body.operationName === 'currentUserOrganisationLanguages') {
      req.alias = 'currentUserOrganisationLanguages';
      req.reply({
        statusCode: 200,
        body: {
          data: {
            currentUser: {
              user: {
                organization: {
                  libraryActiveLanguages,
                  defaultLanguage: { id: defaultLanguageId, label: 'English' },
                },
              },
            },
          },
        },
      });
      return;
    }
    req.continue();
  });
};

const mockTemplateLibrary = (entries: any[] = templateLibraryData) => {
  cy.intercept('POST', '**/api', (req) => {
    if (req.body.operationName === 'templateLibrary') {
      req.alias = 'templateLibrary';
      req.reply({ statusCode: 200, body: { data: { templateLibrary: entries } } });
    } else {
      req.continue();
    }
  });
};

const mockTemplateLibraryError = () => {
  cy.intercept('POST', '**/api', (req) => {
    if (req.body.operationName === 'templateLibrary') {
      req.alias = 'templateLibrary';
      req.reply({ statusCode: 200, body: { errors: [{ message: 'Something went wrong' }] } });
    } else {
      req.continue();
    }
  });
};

const mockLibraryCreateSessionTemplate = () => {
  cy.intercept('POST', '**/api', (req) => {
    if (req.body.operationName === 'createSessionTemplate') {
      req.alias = 'createSessionTemplate';
      const input = req.body.variables.input;
      req.reply({
        statusCode: 200,
        body: {
          data: {
            createSessionTemplate: {
              __typename: 'SessionTemplateResult',
              sessionTemplate: {
                __typename: 'SessionTemplate',
                id: '9990000',
                label: null,
                body: input.body,
                footer: input.footer ?? null,
                isActive: true,
                isHsm: true,
                updatedAt: new Date().toISOString(),
                translations: null,
                type: input.type ?? 'TEXT',
                quality: 'UNKNOWN',
                category: input.category,
                language: libraryActiveLanguages.find(
                  (language) => language.id === input.languageId
                ),
                bspId: null,
                shortcode: input.shortcode,
                status: 'PENDING',
                reason: null,
                isReserved: false,
                numberParameters: 0,
                hasButtons: Boolean(input.hasButtons),
                buttons: input.buttons ?? null,
                buttonType: input.buttonType ?? null,
                tag: null,
                MessageMedia: null,
                example: input.example ?? input.body,
              },
              errors: null,
            },
          },
        },
      });
      return;
    }
    req.continue();
  });
};

const openLibraryFromCreatePage = () => {
  cy.visit('/template/add');
  cy.get('[data-testid="templateLibrary"]').click();
  cy.contains('[data-testid="dialogTitle"]', 'Template Library').should('be.visible');
};

const expandGroup = (usecase: string) => {
  cy.get(`[data-testid="library-group-header-${usecase}"]`).click();
};

beforeEach(() => {
  cy.login();
  cy.window().then((win) => {
    win.localStorage.setItem('organizationServices', JSON.stringify({ templateV2Enabled: true }));
  });
});

describe('Template Library — browsing the catalog', () => {
  beforeEach(() => {
    mockUserLanguages();
    mockTemplateLibrary();
    openLibraryFromCreatePage();
    cy.wait('@templateLibrary');
  });

  it('groups entries by usecase, collapsed by default, and reveals entries on expand', () => {
    cy.contains('Browse all pre-approved WhatsApp message templates');
    cy.get('[data-testid="library-group"]').should('have.length', 3);
    cy.contains(
      '[data-testid="library-group-header-APPOINTMENT_REMINDER"]',
      'Appointment reminder'
    );
    cy.contains('[data-testid="library-group-header-APPOINTMENT_REMINDER"]', '(1)');
    cy.get('[data-testid="library-entry-appointment_reminder_1"]').should('not.exist');

    expandGroup('APPOINTMENT_REMINDER');
    cy.get('[data-testid="library-entry-appointment_reminder_1"]').should('be.visible');
  });

  it('defaults the language filter to the organization default language when it matches an available option', () => {
    cy.get('[data-testid="library-language-filter"]').should('contain', 'English');

    expandGroup('ACCOUNT_CREATION_CONFIRMATION');
    cy.get('[data-testid="library-entry-order_confirmation_1"]').should('be.visible');
    cy.get('[data-testid="library-entry-account_creation_confirmation_3"]').should('not.exist');
  });

  it('filters entries by search text across the catalog and resets via the clear button', () => {
    cy.get('[data-testid="library-language-filter"]').click();
    cy.contains('li', 'All languages').click({ force: true });

    cy.get('[data-testid="searchForm"] input').type('order_confirmation');
    cy.get('[data-testid="library-entry-order_confirmation_1"]').should('be.visible');
    cy.get('[data-testid="library-group-header-APPOINTMENT_REMINDER"]').should('not.exist');
    cy.get('[data-testid="library-entry-account_creation_confirmation_3"]').should('not.exist');

    cy.get('[data-testid="resetButton"]').click();
    cy.get('[data-testid="searchForm"] input').should('have.value', '');
    cy.get('[data-testid="library-group-header-APPOINTMENT_REMINDER"]').should('be.visible');
  });

  it('filters entries by language, keeping use-cases with no match visible but dimmed', () => {
    cy.get('[data-testid="library-language-filter"]').click();
    cy.contains('li', 'Norwegian Bokmål').click({ force: true });

    expandGroup('ACCOUNT_CREATION_CONFIRMATION');
    cy.get('[data-testid="library-entry-account_creation_confirmation_3"]').should('be.visible');
    cy.get('[data-testid="library-entry-order_confirmation_1"]').should('not.exist');

    cy.get('[data-testid="library-group-header-APPOINTMENT_REMINDER"]')
      .closest('div')
      .invoke('attr', 'class')
      .should('match', /GroupEmpty/);

    expandGroup('APPOINTMENT_REMINDER');
    cy.contains('No Appointment reminder templates in Norwegian Bokmål');
  });

  it('shows the full catalog count in the footer', () => {
    cy.contains('Showing 4 of 4 templates');
  });

  it('keeps "Create from template" disabled until an entry is selected, then previews it', () => {
    cy.get('[data-testid="ok-button"]').should('be.disabled');
    cy.contains('Select a template to preview it here.');

    expandGroup('APPOINTMENT_REMINDER');
    cy.get('[data-testid="library-entry-appointment_reminder_1"]').click();

    cy.get('[data-testid="ok-button"]').should('not.be.disabled');
    cy.contains('Your appointment is on');
    cy.contains('Reschedule');
    cy.contains(
      'Using this template pre-fills the message body, footer, and button fields. All fields stay fully editable.'
    );
  });

  it('resets the search and language filters when closed and reopened', () => {
    cy.get('[data-testid="library-language-filter"]').click();
    cy.contains('li', 'Norwegian Bokmål').click({ force: true });
    cy.get('[data-testid="searchForm"] input').type('account_creation');

    cy.get('[data-testid="cancel-button"]').click();
    cy.get('[data-testid="dialogTitle"]').should('not.exist');

    cy.get('[data-testid="templateLibrary"]').click();
    cy.wait('@templateLibrary');
    cy.get('[data-testid="library-language-filter"]').should('contain', 'English');
    cy.get('[data-testid="searchForm"] input').should('have.value', '');
  });
});

describe('Template Library — creating a template from a library entry', () => {
  it('pre-fills body, category, language, and button from the chosen entry, then creates the template', () => {
    const shortcode = 'cy_library_' + Date.now();

    mockUserLanguages();
    mockTemplateLibrary();
    mockLibraryCreateSessionTemplate();

    openLibraryFromCreatePage();
    cy.wait('@templateLibrary');

    expandGroup('APPOINTMENT_REMINDER');
    cy.get('[data-testid="library-entry-appointment_reminder_1"]').click();
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="dialogTitle"]').should('not.exist');
    cy.location('pathname').should('eq', '/template/add');

    cy.get('[data-testid="editor-body"]').should('contain', 'Your appointment is on');
    cy.contains('button', 'Utility')
      .invoke('attr', 'class')
      .should('match', /TileSelected/);
    cy.contains('button', 'Quick Reply')
      .invoke('attr', 'class')
      .should('match', /TileSelected/);
    cy.get('input[placeholder="e.g., Yes, No, More Info"]').should('have.value', 'Reschedule');
    cy.get('[data-testid="AutocompleteInput"] input').eq(0).should('have.value', 'English');

    cy.get('input[name="newShortcode"]').clear().type(shortcode);
    cy.get('[data-testid="submitActionButton"]').should('not.contain', 'Validating URL').click();

    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.shortcode).to.eq(shortcode);
      expect(input.category).to.eq('UTILITY');
      expect(input.languageId).to.eq(englishId);
      expect(input.body).to.contain('Your appointment is on');
      expect(input.hasButtons).to.eq(true);
      expect(input.buttonType).to.eq('QUICK_REPLY');
      expect(JSON.parse(input.buttons)).to.deep.eq([{ type: 'QUICK_REPLY', text: 'Reschedule' }]);
    });
    cy.contains('HSM Template created successfully!');
    cy.location('pathname').should('eq', '/template');
  });

  it('lets a user close the library without choosing a template and create one manually instead', () => {
    mockUserLanguages();
    mockTemplateLibrary();

    openLibraryFromCreatePage();
    cy.wait('@templateLibrary');

    cy.get('[data-testid="cancel-button"]').click();
    cy.get('[data-testid="dialogTitle"]').should('not.exist');
    cy.get('[data-testid="editor-body"]').should('not.contain', 'Your appointment is on');
    cy.get('input[name="newShortcode"]').should('have.value', '');
  });
});

describe('Template Library — empty catalog', () => {
  it('shows an empty state when the catalog has no entries', () => {
    mockUserLanguages();
    mockTemplateLibrary([]);

    openLibraryFromCreatePage();
    cy.wait('@templateLibrary');

    cy.contains('No templates found.');
    cy.contains('Showing 0 of 0 templates');
    cy.get('[data-testid="ok-button"]').should('be.disabled');
  });
});

describe('Template Library — fetch failure', () => {
  it('shows an error notification instead of silently rendering an empty catalog', () => {
    mockUserLanguages();
    mockTemplateLibraryError();

    openLibraryFromCreatePage();
    cy.wait('@templateLibrary');

    cy.get('[data-testid="errorMessage"]').should('be.visible');
  });
});
