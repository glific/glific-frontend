import { BELOW_STICKY_HEADER } from './assistant-flow';

type GetOptions = Partial<Cypress.Timeoutable>;

export const guardrailRule = (id: string, options?: GetOptions) =>
  cy.get(`[data-testid="guardrailRule-${id}"]`, options);

export const guardrailToggle = (id: string, options?: GetOptions) =>
  cy.get(`[data-testid="guardrailToggle-${id}"]`, options);

export const toggleGuardrail = (id: string, options?: GetOptions) =>
  guardrailToggle(id, options).click(BELOW_STICKY_HEADER);

export const openContentSafetyReply = () =>
  cy.get('[data-testid="editReplyToggle"]').click(BELOW_STICKY_HEADER);

export const contentSafetyReplyInput = () =>
  guardrailRule('content-safety').find('[data-testid="setReplyInput"]');

export const setContentSafetyReply = (reply: string) => {
  openContentSafetyReply();
  contentSafetyReplyInput().type(reply);
};
