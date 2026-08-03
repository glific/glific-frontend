describe('ChatCollection', () => {
  beforeEach(function () {
    cy.login();
    cy.addContactToCollection();
    cy.visit('/chat/collection');
    cy.get('[data-testid="searchInput"]').click().wait(500).type('Default Group').wait(1000);
    cy.get('[data-testid="name"]').click().wait(500);
  });

  it('should send the message to collection', () => {
    cy.sendTextMessage('collection');
  });

  it('should send the emoji to collection', () => {
    cy.sendEmojiMessage('collection');
  });

  it('should send attachment to collection - Image', () => {
    cy.sendImageAttachment('collection');
  });

  it('should send attachment to collection - Video', () => {
    cy.sendVideoAttachment('collection');
  });

  it('should send attachment to collection - Audio', () => {
    cy.sendAudioAttachment('collection');
  });

  it('should send attachment to collection - Document', () => {
    cy.sendDocumentAttachment('collection');
  });

  it('should send attachment to collection - Sticker', () => {
    cy.sendStickerAttachment('collection');
  });

  it('should jump to latest', () => {
    cy.jumpToLatest();
  });
});
