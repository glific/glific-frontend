// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

Cypress.Commands.add('verifyLastMessageTimestamp', () => {
  cy.get('[data-testid="message"]')
    .last()
    .find('[data-testid="date"]')
    .invoke('text')
    .then((messageTime) => {
      const trimmed = messageTime.trim();
      const isPm = /pm$/i.test(trimmed);
      const isAm = /am$/i.test(trimmed);
      const timePart = trimmed.replace(/\s*[ap]m$/i, '');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (isPm && hours !== 12) hours += 12;
      if (isAm && hours === 12) hours = 0;

      const now = new Date();
      now.setSeconds(0, 0);
      const messageDate = new Date(now);
      messageDate.setHours(hours, minutes, 0, 0);
      const dayBefore = new Date(messageDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const dayAfter = new Date(messageDate);
      dayAfter.setDate(dayAfter.getDate() + 1);
      const diff = Math.min(
        Math.abs(now - messageDate),
        Math.abs(now - dayBefore),
        Math.abs(now - dayAfter)
      );

      expect(diff).to.be.lte(2 * 60 * 1000);
    });
});

Cypress.Commands.add('sendTextMessage', (type) => {
  const messageText = 'Sample Message for testing ' + +new Date();
  cy.get('[data-testid="editor"]').click().type(messageText);
  cy.get('[data-testid="sendButton"]').click().wait(500);
  cy.checkContactStatus(type);
  // wait for 1 second for the subscription to receieve
  cy.wait(2000);
  // check if the same msg is showing on screen after send

  cy.get('[data-testid="message"]').last().should('contain', messageText);
  cy.verifyLastMessageTimestamp();
});

Cypress.Commands.add('sendEmojiMessage', (type) => {
  cy.get('[data-testid="editor"]').click();
  cy.get('[data-testid="emoji-picker"]').click();
  cy.wait(500);
  cy.get('em-emoji-picker').shadow().find('button[aria-label="😀"]').eq(1).click({ force: true });
  cy.get('[data-testid="editor"]').then((text) => {
    cy.get('[data-testid="sendButton"]').click();
    cy.checkContactStatus(type);
    cy.get('[data-testid="message"]')
      .last()
      .find('[data-testid="content"] span')
      .should('be.visible')
      .and('contain.text', '😀');
  });
});

Cypress.Commands.add('sendImageAttachment', (type) => {
  const captions = 'Image ' + +new Date();
  cy.get("button[data-testid='attachmentIcon']").click();
  cy.get('#mui-component-select-attachmentType').click();
  cy.get(
    'body > #menu-attachmentType > .MuiPaper-root > .MuiList-root > .MuiButtonBase-root:nth-child(1)'
  ).click();
  cy.get('[data-testid="outlinedInput"]').click();
  cy.get('[data-testid="outlinedInput"]').type(
    'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg'
  );
  cy.wait(2000);
  cy.addAttachmentCaption(captions, type);
});

Cypress.Commands.add('sendVideoAttachment', (type) => {
  const captions = 'Video ' + +new Date();
  cy.get("button[data-testid='attachmentIcon']").click();
  cy.get('#mui-component-select-attachmentType').click();
  cy.get(
    'body > #menu-attachmentType > .MuiPaper-root > .MuiList-root > .MuiButtonBase-root:nth-child(3)'
  ).click();
  cy.get('[data-testid="outlinedInput"]').click();
  cy.get('[data-testid="outlinedInput"]').type(
    'https://www.buildquickbots.com/whatsapp/media/sample/video/sample01.mp4'
  );
  cy.wait(2000);
  cy.addAttachmentCaption(captions, type);
});

Cypress.Commands.add('sendAudioAttachment', (type) => {
  cy.get("button[data-testid='attachmentIcon']").click();
  cy.get('#mui-component-select-attachmentType').click();
  cy.get(
    'body > #menu-attachmentType > .MuiPaper-root > .MuiList-root > .MuiButtonBase-root:nth-child(2)'
  ).click();
  cy.get('[data-testid="outlinedInput"]').click();
  cy.get('[data-testid="outlinedInput"]').type(
    'https://www.buildquickbots.com/whatsapp/media/sample/audio/sample01.mp3'
  );
  cy.wait(2000);
  cy.addAttachmentCaption('', type);
});

Cypress.Commands.add('sendDocumentAttachment', (type) => {
  const captions = 'Document ' + +new Date();
  cy.get("button[data-testid='attachmentIcon']").click();
  cy.get('#mui-component-select-attachmentType').click();
  cy.get(
    'body > #menu-attachmentType > .MuiPaper-root > .MuiList-root > .MuiButtonBase-root:nth-child(4)'
  ).click();
  cy.get('[data-testid="outlinedInput"]').click();
  cy.get('[data-testid="outlinedInput"]').type(
    'https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf'
  );
  cy.wait(2000);
  cy.addAttachmentCaption(captions, type);
});

Cypress.Commands.add('sendStickerAttachment', (type) => {
  cy.get("button[data-testid='attachmentIcon']").click();
  cy.get('#mui-component-select-attachmentType').click();
  cy.get(
    'body > #menu-attachmentType > .MuiPaper-root > .MuiList-root > .MuiButtonBase-root:nth-child(5)'
  ).click();
  cy.get('[data-testid="outlinedInput"]').click();
  cy.get('[data-testid="outlinedInput"]').type(
    'http://www.buildquickbots.com/whatsapp/stickers/SampleSticker01.webp'
  );
  cy.wait(2000);
  cy.addAttachmentCaption('', type);
});

// common method to add captions with attachments
Cypress.Commands.add('addAttachmentCaption', (captions, type) => {
  cy.get('[data-testid="ok-button"]').click();
  if (captions) {
    cy.get('[data-testid="editor"]').type(captions);
  }
  cy.get('[data-testid="sendButton"]').click();
  cy.checkContactStatus(type);
  cy.wait(1000);
  if (captions) {
    cy.wait(1000);
    // check if attachment is showing on screen
    cy.get('[data-testid="message"]')
      .last()
      .then((ele) => {
        if (ele.length > 0) {
          cy.get('[data-testid="message"]').find('div').should('contain', captions);
        }
      });
  }
  cy.verifyLastMessageTimestamp();
  cy.wait(1000);
});

Cypress.Commands.add('jumpToLatest', () => {
  cy.get('[data-testid="messageContainer"]')
    .find('[data-testid="message"]')
    .then((msg) => {
      if (msg.length > 10) {
        cy.get('[data-testid="messageContainer"]').scrollTo('top', {
          duration: 1,
        });
        cy.wait(500);

        // need to check why these are failing
        // cy.get('[data-testid="jumpToLatest"]').click({ force: true });
        // cy.window().its("scrollY").should("equal", 0); //  confirm whether its came back to its original position
      }
    });
});

Cypress.Commands.add('sessionTimer', (className, tooltipMsg) => {
  var regexp = new RegExp(className, 'gi');
  cy.get('[data-testid="timerCount"]').eq(1).should('have.attr', 'class').and('match', regexp);
  cy.get('[data-testid="timerCount"]').eq(1).trigger('mouseover');
  cy.get('.MuiTooltip-tooltip').should('contain', tooltipMsg);
});

Cypress.Commands.add('closeSimulator', () => {
  cy.get('[data-testid="layout"]').then((body) => {
    if (body.find('[data-testid="clearIcon"]').length > 0) {
      cy.get('[data-testid="clearIcon"]').click();
    }
  });
});

Cypress.Commands.add('checkContactStatus', (type) => {
  if (type === 'collection') {
    cy.contains('Contact status');
    cy.get('[data-testid="ok-button"]').click();
  }
});

Cypress.Commands.add('addContactToCollection', () => {
  cy.visit('/chat');
  cy.wait(1000);
  cy.get('[data-testid="searchInput"]').click().wait(500).type('Glific Simulator Three').wait(1000);
  cy.get('[data-testid="name"]').click().wait(500);
  cy.get("div[data-testid='listingContainer'] > ul").find('a').first().click();
  cy.get('[data-testid="dropdownIcon"]').click();
  cy.get('[data-testid="collectionButton"]').click();

  cy.get('[data-testid=ArrowDropDownIcon]').click().wait(500);
  cy.get('input[type=checkbox]').then(() => {
    // Ensure the checkbox with label "Default Group" is checked, and handle dialog accordingly
    cy.get('li.MuiAutocomplete-option')
      .contains(/^Default Group$/)
      .then(($option) => {
        const $checkbox = $option.find('input[type="checkbox"]');
        if ($checkbox.length && !$checkbox.prop('checked')) {
          // If not checked, click to check
          cy.wrap($checkbox).click();
          cy.get('[data-testid=ArrowDropDownIcon]').click().wait(500);
          cy.get('[data-testid="ok-button"]').should('be.visible').click();
          cy.get('div').should('contain', 'Added to 1 collection');
        } else {
          // If already checked, close the dialog by clicking outside
          cy.get('[data-testid=autocomplete-element]').click().wait(500);
        }
      });
  });
});
