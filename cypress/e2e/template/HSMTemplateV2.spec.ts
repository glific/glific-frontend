let activeLanguages: Array<{ id: string; label: string; locale: string }> = [];

const languageByLabel = (label: string) => {
  const found = activeLanguages.find((language) => language.label === label);
  if (!found) {
    throw new Error(`Expected an active "${label}" language in this org's language list`);
  }
  return found;
};

const languageById = (id: string) => {
  const found = activeLanguages.find((language) => language.id === id);
  if (!found) {
    throw new Error(`Expected an active language with id "${id}" in this org's language list`);
  }
  return found;
};

const imageURL = 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg';
const documentURL = 'https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf';

const mediaUrlForType = (type: string) => {
  if (type === 'IMAGE') return imageURL;
  if (type === 'DOCUMENT') return documentURL;
  return '';
};

let mockIdCounter = 0;
const nextMockId = () => String(9990000 + mockIdCounter++);

const buildMockSessionTemplate = (input: any) => ({
  __typename: 'SessionTemplate',
  id: nextMockId(),
  label: input.label ?? null,
  body: input.body,
  footer: input.footer ?? null,
  isActive: true,
  isHsm: true,
  updatedAt: new Date().toISOString(),
  translations: null,
  type: input.type ?? 'TEXT',
  quality: 'UNKNOWN',
  category: input.category,
  language: { __typename: 'Language', ...languageById(input.languageId) },
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
  MessageMedia: input.messageMediaId
    ? {
        __typename: 'MessageMedia',
        id: String(input.messageMediaId),
        caption: input.body,
        sourceUrl: mediaUrlForType(input.type),
      }
    : null,
  example: input.example ?? input.body,
});

const openCreatePage = () => {
  cy.get('[data-testid="newItemButton"]').click();
  cy.contains('Create a new HSM Template');
};

const setShortcode = (value: string) => {
  cy.get('input[name="newShortcode"]').clear().click().type(value);
};

const selectLanguage = (label: string) => {
  cy.get('[data-testid="AutocompleteInput"] input').eq(0).click().clear().type(label);
  cy.contains(label).click({ force: true });
};

const selectCategory = (label: 'Utility' | 'Marketing') => {
  cy.contains('button', label).click();
};

const setBodyAndSettle = (text: string) => {
  cy.get('[data-testid="editor-body"]').click().type(text).blur({ force: true });
  cy.get('[data-testid="beneficiaryName"]').click();
  cy.get('html').click();
};

const setFooter = (value: string) => {
  cy.get('input[name="footer"]').clear().type(value);
};

const createTag = (label: string) => {
  cy.get('[data-testid="AutocompleteInput"] input').eq(1).click({ force: true }).type(label);
  cy.contains(`Create "${label}"`).click({ force: true });
};

const submit = () => {
  cy.get('[data-testid="submitActionButton"]').should('not.contain', 'Validating URL').click();
};

const mockCreateSessionTemplate = (...alsoSpyOn: string[]) => {
  cy.intercept('POST', '**/api', (req) => {
    const op = req.body.operationName;
    if (op === 'createSessionTemplate') {
      req.alias = 'createSessionTemplate';
      const sessionTemplate = buildMockSessionTemplate(req.body.variables.input);
      req.reply({
        statusCode: 200,
        body: {
          data: {
            createSessionTemplate: {
              __typename: 'SessionTemplateResult',
              sessionTemplate,
              errors: null,
            },
          },
        },
      });
      return;
    }
    if (alsoSpyOn.includes(op)) {
      req.alias = op;
    }
    req.continue();
  });
};

const mockTemplateBackend = () => {
  const store = new Map<string, any>();

  cy.intercept('POST', '**/api', (req) => {
    const op = req.body.operationName;

    if (op === 'createSessionTemplate') {
      req.alias = 'createSessionTemplate';
      const sessionTemplate = buildMockSessionTemplate(req.body.variables.input);
      store.set(sessionTemplate.id, sessionTemplate);
      req.reply({
        statusCode: 200,
        body: {
          data: {
            createSessionTemplate: {
              __typename: 'SessionTemplateResult',
              sessionTemplate,
              errors: null,
            },
          },
        },
      });
      return;
    }

    if (op === 'sessionTemplates') {
      req.alias = 'sessionTemplates';
      req.reply({
        statusCode: 200,
        body: { data: { sessionTemplates: Array.from(store.values()) } },
      });
      return;
    }

    if (op === 'getsessionTemplate') {
      req.alias = 'getsessionTemplate';
      const sessionTemplate = store.get(req.body.variables.id) ?? null;
      req.reply({
        statusCode: 200,
        body: {
          data: { sessionTemplate: { __typename: 'SessionTemplateResult', sessionTemplate } },
        },
      });
      return;
    }

    if (op === 'deleteSessionTemplate') {
      req.alias = 'deleteSessionTemplate';
      store.delete(req.body.variables.id);
      req.reply({ statusCode: 200, body: { data: { deleteSessionTemplate: { errors: null } } } });
      return;
    }

    if (op === 'createMediaMessage') {
      req.alias = 'createMediaMessage';
    }
    req.continue();
  });

  return store;
};

before(() => {
  cy.login();
  cy.window()
    .then((win) => JSON.parse(win.localStorage.getItem('glific_session') || '{}').access_token)
    .then((accessToken) =>
      cy.request({
        method: 'POST',
        url: Cypress.expose('backendUrl'),
        headers: { authorization: accessToken },
        body: {
          query: `query { currentUser { user { organization { activeLanguages { id label locale } } } } }`,
        },
      })
    )
    .then((response) => {
      activeLanguages = response.body.data.currentUser.user.organization.activeLanguages;
    });
});

beforeEach(() => {
  cy.login();
  cy.window().then((win) => {
    win.localStorage.setItem('organizationServices', JSON.stringify({ templateV2Enabled: true }));
  });
});

describe('HSM Template V2 — List page', () => {
  it('shows the list header and controls, and supports filtering before opening the create page', () => {
    cy.visit('/template');

    cy.get('[data-testid="listHeader"]').should('contain', 'HSM Templates');
    cy.get('[data-testid="newItemButton"]').should('be.visible');
    cy.get('[data-testid="syncHsm"]').should('be.visible');

    cy.get('[data-testid="dropdown-template"]').click();
    cy.get('[data-testid="template-item"]').contains('Pending').click({ force: true });
    cy.get('html').click();
    cy.get('[data-testid="dropdown-template"]').should('contain', 'Pending');

    cy.get('[data-testid="categoryFilter"]').click();
    cy.contains('li', 'Utility').click({ force: true });
    cy.get('[data-testid="categoryFilter"]').should('contain', 'Utility');

    cy.get('[data-testid="newItemButton"]').click();
    cy.location('pathname').should('eq', '/template/add');
  });
});

describe('HSM Template V2 — Create page validation', () => {
  beforeEach(() => {
    cy.visit('/template');
    openCreatePage();
  });

  it('keeps submit disabled until element name, category, and message are all filled in', () => {
    const shortcode = 'cy_validation_' + Date.now();

    cy.get('[data-testid="submitActionButton"]').should('be.disabled');

    setShortcode(shortcode);
    cy.get('[data-testid="submitActionButton"]').should('be.disabled');

    selectCategory('Utility');
    cy.get('[data-testid="submitActionButton"]').should('be.disabled');

    cy.get('[data-testid="editor-body"]').click().type('Hello there').blur({ force: true });
    cy.get('[data-testid="submitActionButton"]').should('not.be.disabled');
  });
});

describe('HSM Template V2 — Full template creation journey', () => {
  it('creates a complete template (language, category, body+variable, footer, a button, media, tag) and lands back on the list', () => {
    const shortcode = 'cy_full_journey_' + Date.now();
    const tagLabel = 'cy_tag_' + Date.now();
    const message = 'Your order is ready for pickup';

    mockCreateSessionTemplate('createMediaMessage');

    cy.visit('/template');
    openCreatePage();

    selectLanguage('English');
    setShortcode(shortcode);

    selectCategory('Utility');
    selectCategory('Marketing');
    cy.contains('button', 'Marketing')
      .invoke('attr', 'class')
      .should('match', /TileSelected/);
    selectCategory('Utility');
    cy.contains('button', 'Utility')
      .invoke('attr', 'class')
      .should('match', /TileSelected/);
    cy.contains('button', 'Marketing')
      .invoke('attr', 'class')
      .should('not.match', /TileSelected/);

    cy.get('[data-testid="editor-body"]').click().type(message);
    cy.get('[data-testid="bold-icon"]').click();
    cy.get('[data-testid="editor-body"]').should('contain', '**');
    cy.contains('Add Variable').click();
    cy.get('[data-testid="variable"]').should('have.length', 1);
    cy.get('input[placeholder="Define value"]').type('User');

    setFooter('Team Glific');

    cy.contains('button', 'Quick Reply').click();
    cy.get('input[placeholder="e.g., Yes, No, More Info"]').type('Track order');

    cy.contains('button', 'Image').click();
    cy.get('input[name="attachmentURL"]').click().type(imageURL);

    cy.get('[data-testid="beneficiaryName"]').click();
    cy.get('html').click();
    cy.get('[data-testid=imageMessage] > img', { timeout: 10000 }).should(
      'have.attr',
      'src',
      imageURL
    );

    createTag(tagLabel);

    submit();

    cy.wait('@createMediaMessage');
    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.shortcode).to.eq(shortcode);
      expect(input.category).to.eq('UTILITY');
      expect(input.isHsm).to.eq(true);
      expect(input.languageId).to.eq(languageByLabel('English').id);
      expect(input.footer).to.eq('Team Glific');
      expect(input.example).to.contain('[User]');
      expect(input.hasButtons).to.eq(true);
      expect(input.buttonType).to.eq('QUICK_REPLY');
      expect(JSON.parse(input.buttons)).to.deep.eq([{ type: 'QUICK_REPLY', text: 'Track order' }]);
      expect(input.type).to.eq('IMAGE');
      expect(input.attachmentURL).to.eq(undefined);
      expect(input.messageMediaId).to.be.a('number');

      const created = interception.response.body.data.createSessionTemplate.sessionTemplate;
      expect(created.id).to.be.a('string');
      expect(created.shortcode).to.eq(shortcode);
    });

    cy.contains('HSM Template created successfully!');
    cy.location('pathname').should('eq', '/template');
  });
});

describe('HSM Template V2 — Button types end-to-end', () => {
  beforeEach(() => {
    cy.visit('/template');
  });

  it('submits a Call to Action template with a static phone number and a dynamic URL button', () => {
    const shortcode = 'cy_cta_' + Date.now();
    mockCreateSessionTemplate();

    openCreatePage();
    selectLanguage('English');
    setShortcode(shortcode);
    selectCategory('Utility');
    setBodyAndSettle('Reach out or track your order below.');

    cy.contains('button', 'Call to Action').click();

    cy.contains('button', 'Phone number').click();
    cy.get('[data-testid="buttonTitle"] input').eq(0).type('Call Us');
    cy.get('[data-testid="buttonValue"] input').eq(0).type('9876543210');
    cy.contains('button', 'Call to Action');

    cy.get('[data-testid="addButton"]').click();
    cy.contains('button', 'Phone number').should('be.disabled');
    cy.get('[data-testid="buttonTitle"] input').eq(1).type('Track Order');
    cy.get('[data-testid="buttonValue"] input').eq(1).type('https://example.com/track');
    cy.contains('Advanced').click();
    cy.contains('Static URL').should('be.visible');
    cy.contains('Dynamic URL').click();
    cy.get('input[placeholder="Sample Suffix"]').type('promo');

    submit();

    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.hasButtons).to.eq(true);
      expect(input.buttonType).to.eq('CALL_TO_ACTION');
      expect(JSON.parse(input.buttons)).to.deep.eq([
        { type: 'PHONE_NUMBER', text: 'Call Us', phone_number: '9876543210' },
        {
          type: 'URL',
          text: 'Track Order',
          url: 'https://example.com/track{{1}}',
          example: ['https://example.com/trackpromo'],
        },
      ]);
    });
    cy.contains('HSM Template created successfully!');
  });

  it('submits a Quick Reply template with multiple buttons after adding and removing one', () => {
    const shortcode = 'cy_qr_' + Date.now();
    mockCreateSessionTemplate();

    openCreatePage();
    selectLanguage('English');
    setShortcode(shortcode);
    selectCategory('Utility');
    setBodyAndSettle('Please choose an option below.');

    cy.contains('button', 'Quick Reply').click();
    cy.contains('Maximum 10 quick reply buttons allowed per template');
    cy.get('input[placeholder="e.g., Yes, No, More Info"]').eq(0).type('Yes');
    cy.contains('3 / 20');

    cy.get('[data-testid="addButton"]').click();
    cy.get('input[placeholder="e.g., Yes, No, More Info"]').eq(1).type('No');
    cy.get('[data-testid="delete-icon"]').should('have.length', 2);

    cy.get('[data-testid="delete-icon"]').eq(1).click();
    cy.get('input[placeholder="e.g., Yes, No, More Info"]').should('have.length', 1);

    submit();

    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.hasButtons).to.eq(true);
      expect(input.buttonType).to.eq('QUICK_REPLY');
      expect(JSON.parse(input.buttons)).to.deep.eq([{ type: 'QUICK_REPLY', text: 'Yes' }]);
    });
    cy.contains('HSM Template created successfully!');
  });

  it('submits a WhatsApp Form template after selecting a form, screen, and button title', () => {
    const shortcode = 'cy_waform_' + Date.now();
    const formName = 'Cypress Feedback Form';
    const formId = 'cy_meta_flow_' + Date.now();

    cy.intercept('POST', '**/api', (req) => {
      const op = req.body.operationName;
      if (op === 'listWhatsappForms') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              listWhatsappForms: [
                {
                  __typename: 'WhatsappForm',
                  id: formId,
                  name: formName,
                  metaFlowId: formId,
                  revision: {
                    __typename: 'WhatsappFormRevision',
                    id: formId,
                    definition: JSON.stringify({ screens: [{ id: 'WELCOME_SCREEN' }] }),
                  },
                },
              ],
            },
          },
        });
        return;
      }
      if (op === 'createSessionTemplate') {
        req.alias = 'createSessionTemplate';
        const sessionTemplate = buildMockSessionTemplate(req.body.variables.input);
        req.reply({
          statusCode: 200,
          body: {
            data: {
              createSessionTemplate: {
                __typename: 'SessionTemplateResult',
                sessionTemplate,
                errors: null,
              },
            },
          },
        });
        return;
      }
      req.continue();
    });

    openCreatePage();
    selectLanguage('English');
    setShortcode(shortcode);
    selectCategory('Utility');
    setBodyAndSettle('Please fill out this quick form.');

    cy.contains('button', 'WhatsApp Form').click();
    cy.contains('Select Form*');
    cy.get('input[placeholder="Select a form"]').click().type(formName);
    cy.contains('li', formName).click();

    cy.get('input[placeholder="e.g., contact_us"]').click();
    cy.contains('li', 'WELCOME_SCREEN').click();

    cy.get('input[placeholder="e.g., Fill Form"]').type('Continue');

    submit();

    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.hasButtons).to.eq(true);
      expect(input.buttonType).to.eq('WHATSAPP_FORM');
      expect(JSON.parse(input.buttons)).to.deep.eq([
        {
          type: 'FLOW',
          navigate_screen: 'WELCOME_SCREEN',
          text: 'Continue',
          flow_id: formId,
          flow_action: 'NAVIGATE',
        },
      ]);
    });
    cy.contains('HSM Template created successfully!');
  });
});

describe('HSM Template V2 — Media attachment end-to-end', () => {
  it('handles the Upload File / Provide URL toggle per the org GCS setting, then submits via Provide URL with the messageMediaId conversion verified', () => {
    const shortcode = 'cy_media_' + Date.now();
    const sampleMessage = 'Please find your invoice attached.';
    mockCreateSessionTemplate('createMediaMessage');

    cy.visit('/template');
    openCreatePage();
    selectLanguage('English');
    setShortcode(shortcode);
    selectCategory('Utility');

    cy.contains('button', 'Document').click();
    cy.contains('How would you like to provide the attachment?');

    cy.window().then((win) => {
      const services = JSON.parse(win.localStorage.getItem('organizationServices') || '{}');
      const gcsEnabled = Boolean(services.googleCloudStorage);

      cy.contains('button', 'Upload File').click();
      if (gcsEnabled) {
        cy.contains('Click to upload or drag and drop').should('be.visible');
        cy.contains('button', 'Provide URL').click();
      } else {
        cy.contains(
          'File upload is not available for your organization. Please use "Provide URL" instead, or ask your admin to enable Google Cloud Storage.'
        );
        cy.contains('Click to upload or drag and drop').should('not.exist');
      }
    });

    cy.get('input[name="attachmentURL"]').click().type(documentURL);

    setBodyAndSettle(sampleMessage);

    cy.get('[data-testid=documentMessage]', { timeout: 10000 }).should('contain', sampleMessage);
    cy.get('[data-testid=documentMessage] > a').should('have.attr', 'href', documentURL);

    submit();

    cy.wait('@createMediaMessage');
    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.type).to.eq('DOCUMENT');
      expect(input.attachmentURL).to.eq(undefined);
      expect(input.messageMediaId).to.be.a('number');
    });
    cy.contains('HSM Template created successfully!');
  });
});

describe('HSM Template V2 — Copy journey', () => {
  it('copies a template with buttons and media into a new template, leaving the source untouched', () => {
    const sourceShortcode = 'cy_copy_source_' + Date.now();
    const copyShortcode = 'cy_copy_target_' + Date.now();
    const sourceMessage = 'Your appointment is confirmed for tomorrow.';

    mockTemplateBackend();
    cy.visit('/template');
    openCreatePage();
    selectLanguage('English');
    setShortcode(sourceShortcode);
    selectCategory('Utility');
    cy.contains('button', 'Quick Reply').click();
    cy.get('input[placeholder="e.g., Yes, No, More Info"]').type('Confirm');
    cy.contains('button', 'Image').click();
    cy.get('input[name="attachmentURL"]').click().type(imageURL);
    setBodyAndSettle(sourceMessage);
    submit();

    let sourceId: string;
    cy.wait('@createMediaMessage');
    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.shortcode).to.eq(sourceShortcode);
      expect(input.buttonType).to.eq('QUICK_REPLY');
      expect(JSON.parse(input.buttons)).to.deep.eq([{ type: 'QUICK_REPLY', text: 'Confirm' }]);
      expect(input.messageMediaId).to.be.a('number');
      sourceId = interception.response.body.data.createSessionTemplate.sessionTemplate.id;
    });
    cy.contains('HSM Template created successfully!');
    cy.location('pathname').should('eq', '/template');
    cy.wait('@sessionTemplates');

    cy.get('[data-testid="tableBody"]')
      .contains('tr', sourceShortcode)
      .find('[data-testid="copyTemplate"]')
      .click();
    cy.location('pathname').should('eq', '/template/add');

    cy.get('input[name="newShortcode"]').should('have.value', '').and('not.be.disabled');
    cy.get('[data-testid="AutocompleteInput"] input').eq(0).should('have.value', 'English');
    cy.get('[data-testid="editor-body"]').should('contain', sourceMessage);
    cy.get('input[placeholder="e.g., Yes, No, More Info"]').should('have.value', 'Confirm');
    cy.get('input[name="attachmentURL"]').should('have.value', imageURL);

    setShortcode(copyShortcode);
    submit();

    cy.wait('@createMediaMessage');
    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.shortcode).to.eq(copyShortcode);
      expect(input.buttonType).to.eq('QUICK_REPLY');
      expect(JSON.parse(input.buttons)).to.deep.eq([{ type: 'QUICK_REPLY', text: 'Confirm' }]);
      expect(input.messageMediaId).to.be.a('number');

      const copied = interception.response.body.data.createSessionTemplate.sessionTemplate;
      expect(copied.id).to.not.eq(sourceId);
    });
    cy.contains('HSM Template created successfully!');

    cy.then(() => {
      cy.visit(`/template/${sourceId}/edit`);
    });
    cy.get('input[name="newShortcode"]').should('have.value', sourceShortcode);
    cy.get('[data-testid="editor-body"]').should('contain', sourceMessage);
  });
});

describe('HSM Template V2 — Add-language & delete journey', () => {
  it('adds a language to an existing template, submits the variant, then deletes it', () => {
    const shortcode = 'cy_addlang_' + Date.now();
    const englishBody = 'Hi, your booking is confirmed.';
    const hindiBody = 'Namaste, aapki booking confirm ho gayi hai.';

    mockTemplateBackend();
    cy.visit('/template');
    openCreatePage();
    selectLanguage('English');
    setShortcode(shortcode);
    selectCategory('Utility');
    setBodyAndSettle(englishBody);
    submit();

    let anchorId: string;
    cy.wait('@createSessionTemplate').then((interception) => {
      anchorId = interception.response.body.data.createSessionTemplate.sessionTemplate.id;
    });
    cy.contains('HSM Template created successfully!');
    cy.wait('@sessionTemplates');

    cy.then(() => {
      cy.visit(`/template/${anchorId}/edit`);
    });

    cy.get('[data-testid="headerTitle"]').should('contain', shortcode);
    cy.get('input[name="newShortcode"]').should('be.disabled');
    cy.get('[data-testid="submitActionButton"]').should('not.exist');
    cy.get('[data-testid="add-language-link"]').should('be.visible');

    cy.visit('/template');
    cy.wait('@sessionTemplates');
    cy.get('[data-testid="tableBody"]')
      .contains('tr', shortcode)
      .find('[data-testid="add-language-icon"]')
      .click();
    cy.location('pathname').should('eq', '/template/add');
    cy.get('[data-testid="headerTitle"]').should('contain', 'Add Language');
    cy.get('input[name="newShortcode"]').should('have.value', shortcode).and('be.disabled');
    cy.get('[data-testid="editor-body"]').should('not.contain', englishBody);
    cy.get('[data-testid="source-reference-card"]').should('contain', englishBody);

    selectLanguage('Hindi');
    setBodyAndSettle(hindiBody);
    submit();

    let variantId: string;
    cy.wait('@createSessionTemplate').then((interception) => {
      const input = interception.request.body.variables.input;
      expect(input.shortcode).to.eq(shortcode);
      expect(input.languageId).to.eq(languageByLabel('Hindi').id);
      variantId = interception.response.body.data.createSessionTemplate.sessionTemplate.id;
    });
    cy.contains('HSM Template created successfully!');

    cy.wait('@sessionTemplates');
    cy.get('[data-testid="language-version-row"]').should('contain', 'Hindi');

    cy.then(() => {
      cy.get(`[data-testid="delete-language-${variantId}"]`).click();
    });
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Hindi');
    cy.get('[data-testid="ok-button"]').click({ force: true });
    cy.wait('@deleteSessionTemplate').then((interception) => {
      expect(interception.request.body.variables.id).to.eq(variantId);
    });
    cy.contains('Template deleted successfully');
    cy.get(`[data-testid="delete-language-${variantId}"]`).should('not.exist');
  });
});
