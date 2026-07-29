describe('HSM Template', () => {
  const hsmTemplateName = 'Sample HSM Templates ' + +new Date();
  const sampleMessage = 'This is a sample message';
  const imageURL = 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg';
  const documentURL = 'https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf';
  const videoURL =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4';
  const audioURL =
    'https://actions.google.com/sounds/v1/alarms/bugle_tune.https://www.buildquickbots.com/whatsapp/media/sample/audio/sample01.mp3';
  const stickerURL = 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg';

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/template');
  });

  it('should load template list', () => {
    cy.get('[data-testid="listHeader"]').should('contain', 'Templates');
  });

  it('should check validation', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);
    cy.get('[data-testid="submitActionButton"]').click();
    cy.contains('Title is required.');
    cy.contains('Message is required.');
    cy.contains('Element name is required.');
  });

  it('should create new HSM template', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);
    cy.get('input[name=label]').click().wait(500).type(hsmTemplateName);

    cy.get('[data-testid="editor-body"]').click({ force: true }).type('Test message');
    cy.get('[data-testid="beneficiaryName"]').click();

    cy.get('[data-testid=AutocompleteInput] input').eq(1).click().type('UTILITY');
    cy.contains('UTILITY').click({ force: true });

    cy.get('[data-testid=outlinedInput] input')
      .eq(1)
      .click({ force: true })
      .type('sample_templates', { force: true });

    cy.get('[data-testid="submitActionButton"]').click({ force: true });

    // It needs Gupshup setting enabled
    // cy.get(".MuiDialogContent-root").should("contain", "BSP response status");
    // cy.get("div").should("contain", "HSM Template created successfully");
  });

  // Currently to create hsm we need WhatsApp Business is Approved
  // edit and delete will work only if the HSM template is present

  // it("should edit hsm template", () => {
  //   cy.get("input[name=searchInput]")
  //     .click()
  //     .wait(500)
  //     .type(hsmTemplateName + "{enter}");
  //   cy.get("[data-testid=EditIcon]").click();
  //   cy.get('[data-testid="submitActionButton"]').click();
  //   cy.get("div").should("contain", "HSM Template edited successfully");
  // });

  // it("should delete hsm template", () => {
  //   cy.get("input[name=searchInput]")
  //     .click()
  //     .wait(500)
  //     .type(hsmTemplateName + "{enter}");
  //   cy.get("[data-testid=DeleteIcon]").click();
  //   cy.contains("Confirm").click();
  //   cy.get("div").should("contain", "HSM Template deleted successfully");
  // });

  it('should show typed sample message in simulator', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);
    cy.get('input[name=label]').click().wait(500).type(hsmTemplateName);

    cy.get('[data-testid="editor-body"]').click().type(sampleMessage).blur({ force: true });
    cy.get('[data-testid="beneficiaryName"]').click();
    cy.get('html').click();
    cy.wait(2000);
    cy.get('[data-testid="simulatedMessages"] > div > div').should('contain', sampleMessage);
  });

  it('should show attached image with the sample message as caption', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);

    cy.get('input[name="attachmentURL"]').click().type(imageURL).wait(500);
    cy.get('[data-testid="AutocompleteInput"] input').eq(2).click({ force: true }).type('IMA');
    cy.contains('IMAGE').click();

    cy.get('[data-testid="editor-body"]').type(sampleMessage).blur({ force: true });
    cy.get('[data-testid="beneficiaryName"]').click();

    cy.get('html').click();
    cy.wait(5000);

    cy.get('[data-testid=imageMessage] > img').should('have.attr', 'src', imageURL);
    cy.get('[data-testid="simulatedMessages"] > div > div').should('contain', sampleMessage);
  });

  it('should show attached document with the sample message as caption', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);

    cy.get('input[name="attachmentURL"]').click().type(documentURL);

    cy.get('[data-testid="AutocompleteInput"] input').eq(2).click({ force: true }).type('DOC');

    cy.contains('DOCUMENT').click();
    cy.get('[data-testid="editor-body"]').click().type(sampleMessage).blur({ force: true });

    cy.get('[data-testid="beneficiaryName"]').click();

    cy.get('html').click();
    cy.wait(5000);
    cy.get('[data-testid="documentMessage"] > a').should('have.attr', 'href', documentURL);
    cy.get('[data-testid="simulatedMessages"] > div > div').should('contain', sampleMessage);
  });

  it('should show attached video with the sample message as caption', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);
    cy.get('[data-testid="AutocompleteInput"] input').eq(2).click({ force: true }).type('VID');
    cy.contains('VIDEO').click({ force: true });

    cy.get('input[name="attachmentURL"]').click().type(videoURL);

    cy.get('[data-testid="editor-body"]').click().wait(500).type(sampleMessage, { delay: 80 }); // Todo: Adding delay while typing since its not picking up second character. Need to fix this.
    cy.get('[data-testid="beneficiaryName"]').click();
    cy.get('html').click();
    cy.wait(1000);
    cy.get('[data-testid=videoMessage]');
    cy.get('[data-testid="simulatedMessages"] > div > div > :nth-child(1)').should(
      'contain',
      sampleMessage
    );
  });

  it('should not show audio option', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);

    cy.get('[data-testid="AutocompleteInput"] input').eq(2).click({ force: true }).type('AUD');
    cy.should('not.contain', 'AUDIO');
  });

  it('should show not show sticker option', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(1000);

    cy.get('[data-testid="AutocompleteInput"] input').eq(2).click({ force: true }).type('STI');
    cy.should('not.contain', 'STICKER');
  });
});
