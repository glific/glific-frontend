import { aliasQuery } from '../../utils/graphql-test-utils';

describe('Chats', () => {
  const speedSendTitle = 'Speed Send saved from chat ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.intercept('POST', Cypress.expose('backendUrl'), (req) => {
      // Queries
      aliasQuery(req, 'bspbalance');
    });

    cy.visit('/');
    cy.wait(1000);
  });

  it('should send the message correctly', () => {
    cy.sendTextMessage();
  });

  it('should send the emoji in message', () => {
    cy.sendEmojiMessage();
  });

  it('should send the speed send', () => {
    cy.get('[data-testid="shortcut-open-button"]').click().wait(500);
    cy.get('[data-testid="shortcutButton"]')
      .contains('Speed sends')
      .click({ multiple: true, force: true });
    cy.get('[data-testid="templateItem"] :first').click();
    cy.get('[data-testid="sendButton"]').click();
  });

  it('should send the templates', () => {
    cy.get('[data-testid="shortcut-open-button"]').click().wait(500);
    cy.get('[data-testid="shortcutButton"]')
      .contains('Templates')
      .click({ multiple: true, force: true });

    cy.get("form[data-testid='searchForm'] input")
      .first()
      .click({ force: true })
      .type('attached bill');

    cy.get('div:nth-child(1) > [data-testid="templateItem"]').click();
    cy.get('[data-testid=AutocompleteInput]').click().type('ABC');
    cy.get('[data-testid="ok-button"]').click();
    // check if the template is showing on screen after send
    cy.get('[data-testid="editor"]').then((text) => {
      cy.get('[data-testid="sendButton"]').click();
      cy.get('[data-testid="message"]').last().should('contain', 'Please find the attached bill.');
    });
  });

  it('should send add to speed send', () => {
    cy.get('[data-testid="message"]:last()').find('svg').click({ multiple: true, force: true });
    cy.contains('Add to speed sends').click({ force: true });
    // check input field validation
    cy.get('[data-testid="ok-button"]').click({ force: true });
    cy.get('[data-testid="templateContainer"]').find('p').should('contain', 'Required');
    cy.get('[data-testid="templateInput"]').type(speedSendTitle);
    cy.get('[data-testid="ok-button"]').click({ force: true });
    cy.wait(1000);
    cy.get('div').should('contain', 'Message has been successfully added to speed sends.');
  });

  it('Send attachment - Image', () => {
    cy.sendImageAttachment();
  });

  it('Send attachment - Audio', () => {
    cy.sendAudioAttachment();
  });

  it('Send attachment - Video', () => {
    cy.sendVideoAttachment();
  });

  it('Send attachment - Document', () => {
    cy.sendDocumentAttachment();
  });

  it('Send attachment - Sticker', () => {
    cy.sendStickerAttachment();
  });

  it('should jump to latest', () => {
    cy.jumpToLatest();
  });

  it('should go to top', () => {
    cy.get('body').then((body) => {
      if (body[0].querySelector('[data-testid="clearIcon"]')) {
        cy.get('[data-testid="clearIcon"]').click({ force: true });
      }
    });
    cy.get("div[data-testid='listingContainer'] > ul")
      .find('a')
      .then((chats) => {
        if (chats.length > 10) {
          cy.get("div[data-testid='listingContainer']").scrollTo(0, 500);
          cy.wait(500);
          cy.get('div').contains('Go to top').click({ force: true });
          cy.window().its('scrollY').should('equal', 0); //  confirm whether its came back to its original position
        }
      });
  });

  it('should load more chats', () => {
    cy.get('body').then((body) => {
      if (body[0].querySelector('[data-testid="clearIcon"]')) {
        cy.get('[data-testid="clearIcon"]').click({ force: true });
      }
    });
    cy.get("div[data-testid='listingContainer'] > ul")
      .find('a')
      .then((chats) => {
        if (chats.length >= 50) {
          cy.get("div[data-testid='listingContainer']").scrollTo('bottom');
          cy.wait(500);
          cy.get('div').contains('Load more chats').click({ force: true });
        }
      });
  });

  it('should check session timer class/tooltip according to its value', () => {
    cy.closeSimulator();

    cy.get('[data-testid="searchInput"]').click({ force: true }).wait(500).type('Simulator');
    cy.get("div[data-testid='timerContainer']").then((param) => {
      if (parseInt(param[0].innerText) > 10) {
        cy.sessionTimer(
          '_TimerNormal',
          'Session window is open to message this contact. Learn more about the WhatsApp session window here.'
        );
      }
      if (parseInt(param[0].innerText) > 0 && parseInt(param[0].innerText) < 5) {
        cy.sessionTimer(
          '_TimerApproachEnd',
          'Your message window is about to expire! Learn more about the WhatsApp session window here.'
        );
      }
      if (parseInt(param[0].innerText) == 0) {
        cy.sessionTimer(
          '_TimerEnd',
          'Session message window has expired! You can only send a template message now. Learn more about the WhatsApp session window here.'
        );
      }
    });
  });

  it('should conatin help menu in sidebar', () => {
    cy.get('[data-testid=list]').should('contain', 'Help');
  });

  it('should check gupshup wallet balance', () => {
    cy.wait('@gqlbspbalanceQuery')
      .its('response.body.data')
      .should('have.property', 'bspbalance')
      .then(($balance) => {
        const balanceObject = JSON.parse($balance);

        if (balanceObject) {
          const { balance } = balanceObject;
          if (balance < 1) {
            cy.get("div[class*='_WalletBalanceText']").contains('Wallet balance is low');
          } else if (balance > 1) {
            cy.get("div[class*='_WalletBalanceText']").contains('Wallet balance is okay');
          }
        }
      });
  });
});
