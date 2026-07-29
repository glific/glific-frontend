/// <reference types="cypress" />

declare namespace Cypress {
  interface Cypress {
    mocha: {
      getRunner(): {
        suite: {
          tests: Array<{ state?: string }>;
        };
      };
    };
  }

  interface Chainable {
    login(phone?: string, password?: string): Chainable<void>;
    appLogin(phone: string, password: string, baseUrl?: string): Chainable<void>;
    sendTextMessage(type?: string): Chainable<void>;
    sendEmojiMessage(type?: string): Chainable<void>;
    sendImageAttachment(type?: string): Chainable<void>;
    sendVideoAttachment(type?: string): Chainable<void>;
    sendAudioAttachment(type?: string): Chainable<void>;
    sendDocumentAttachment(type?: string): Chainable<void>;
    sendStickerAttachment(type?: string): Chainable<void>;
    addAttachmentCaption(captions: string, type?: string): Chainable<void>;
    verifyLastMessageTimestamp(): Chainable<void>;
    jumpToLatest(): Chainable<void>;
    sessionTimer(className: string, tooltipMsg: string): Chainable<void>;
    closeSimulator(): Chainable<void>;
    checkContactStatus(type?: string): Chainable<void>;
    addContactToCollection(): Chainable<void>;
    deleteFlow(name: string): Chainable<void>;
    fetchList(): Chainable<void>;
    selectFirstValFromList(text: string): Chainable<void>;
    enterInput(): Chainable<void>;
    startFlow(): Chainable<void>;
    create_collection(collectionName: string, isGroup?: boolean): Chainable<void>;
    delete_collection(collectionName: string): Chainable<void>;
    task(event: 'reportInstatus', passed: boolean): Chainable<null>;
  }
}
