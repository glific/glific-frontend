describe('Flow', () => {
  const flowName = 'test flow' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/flow');
  });

  const randomFlowKeyword_en = () => {
    let keyword = '';
    const allowed_characters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 10; i++)
      keyword += allowed_characters.charAt(Math.floor(Math.random() * allowed_characters.length));
    return keyword;
  };

  it('should configure Flow', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.get('[data-testid=outlinedInput]').eq(0).should('be.visible').type(flowName);

    cy.get('[data-testid=outlinedInput]').eq(1).click().type(randomFlowKeyword_en());

    cy.get('[data-testid="additionalActionButton"]').click();

    cy.get('[data-testid="flowName"]').should('contain', flowName);
    cy.wait(4000);
    cy.get('div').contains('Create Message').click();
    cy.get('temba-completion')
      .shadow()
      .find('temba-field')
      .find('temba-textinput')
      .shadow()
      .find('textarea[name=Message]')
      .click()
      .type('Hi');

    cy.get('.ReactModalPortal').contains('Attachments').click();
    cy.fetchList();
    cy.selectFirstValFromList('Image URL');
    cy.enterInput().type('test');
    cy.contains('Ok').click();
    // check URL validation
    cy.get('.ReactModalPortal').contains('This media URL is invalid').click();
    cy.enterInput()
      .clear()
      .type('https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg');
    cy.contains('Checking URL validity', { timeout: 10000 }).should('not.exist');

    cy.contains('Ok').click().wait(2000);

    cy.get('.plumb-exit > div')
      .first()
      .trigger('mousedown', { which: 1, pageX: 600, pageY: 100 })
      .trigger('mousemove', { which: 1, pageX: 600, pageY: 600 })
      .trigger('mouseup');

    cy.get("temba-completion[name='arguments']")
      .shadow()
      .find('temba-field')
      .find('temba-textinput')
      .shadow()
      .find('div.input-container')
      .find('input[name=arguments]')
      .click()
      .type('Hi,hey,hello');

    cy.contains('Ok').click().wait(1000);

    cy.get('.plumb-exit')
      .eq(1)
      .children()
      .eq(1)
      .trigger('mousedown', { which: 1, pageX: 600, pageY: 100 })
      .trigger('mousemove', { which: 1, pageX: 600, pageY: 600 })
      .trigger('mouseup');

    cy.get('temba-completion')
      .shadow()
      .find('temba-field')
      .find('temba-textinput')
      .shadow()
      .find('div.input-container')
      .find('textarea[name=Message]')
      .click()
      .type('Greeting');

    cy.contains('Ok').click().wait(1000);

    cy.get('[data-testid="previewButton"]').click();
    cy.get('[data-testid="simulatorInput"]').type('hello{enter}');

    // close simulator and publish
    cy.get('[data-testid="clearIcon"]').click();
    cy.get('[data-testid="button"]').contains('Publish').click();

    cy.get('[type="button"]').contains('Publish & go back').click();
    cy.get('div').should('contain', 'The flow has been published');
  });

  it('deletes the configured Flow', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(500)
      .type(flowName + '{enter}');
    cy.get('[data-testid="tableBody"]')
      .should('not.be.empty')
      .then(function () {
        cy.get('[data-testid=MoreIcon]').click();
        cy.get('[data-testid=DeleteIcon]').click();
        cy.contains('Confirm').click();
        cy.get('div').should('contain', 'Flow deleted successfully');
      });
  });
});
