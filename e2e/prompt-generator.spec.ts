import { test, expect, Page } from '@playwright/test';

/**
 * E2E for the AI Prompt Generator.
 *
 * Self-contained: it seeds a fake-but-valid session + the promptGeneratorEnabled
 * service flag into localStorage (auth is decided client-side from token_expiry_time),
 * and mocks the GraphQL network so generation is deterministic and offline — no
 * backend or Kaapi required. Only a running dev server (the SPA) is needed.
 */

const GENERATED_PROMPT = 'You are MatsyaMitra, a friendly assistant for small-scale fish farmers...';

// the 9 mandatory answers, keyed by each question's unique placeholder so we target
// the modal's fields (not the create-assistant form behind it)
const ANSWERS: Array<[string, string]> = [
  ['Organisation name and chatbot name...', 'MatsyaMitra by BlueWater Aqua'],
  ['Describe the core purpose...', 'Helps fish farmers with pond and water-quality questions'],
  ['Describe your audience...', 'Small freshwater fish farmers in rural India, low literacy'],
  ['Language preference...', 'Reply in the language the user writes in'],
  ['Describe the tone...', 'Friendly and practical, like a fellow farmer'],
  ['Describe the response format...', 'Short messages, numbered steps for how-tos'],
  ['List off-limits topics, or NA...', 'No veterinary dosages or financial advice'],
  ['Exact fallback message...', 'Sorry, please call our helpline 1800-555-0199'],
  ['Escalation path, or NA...', 'Reply AGENT to reach a fisheries expert'],
];

const seedAuthAndFlag = async (page: Page) => {
  await page.addInitScript(() => {
    const farFuture = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(
      'glific_session',
      JSON.stringify({ access_token: 'e2e-token', renewal_token: 'e2e-renewal', token_expiry_time: farFuture })
    );
    localStorage.setItem(
      'glific_user',
      JSON.stringify({
        id: '1',
        name: 'E2E User',
        roles: ['Admin'],
        organization: { id: '1' },
        language: { locale: 'en' },
      })
    );
    localStorage.setItem('organizationServices', JSON.stringify({ promptGeneratorEnabled: true }));
  });
};

const mockNetwork = async (page: Page) => {
  // REST (session renewal / tracker etc.) — return 200 so bootstrap doesn't block
  await page.route(
    (url) => url.pathname.startsWith('/api/v1'),
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );

  // GraphQL — respond by operation name; generation is mocked to resolve to :ready
  await page.route(
    (url) => url.pathname === '/api',
    (route) => {
      const body = route.request().postDataJSON();
      const op = body?.operationName;
      const data = (payload: unknown) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: payload }) });

      switch (op) {
        // --- bootstrap: the authenticated layout needs a current user + languages ---
        case 'currentUser':
          return data({
            currentUser: {
              user: {
                id: '1',
                name: 'E2E User',
                phone: '911111111111',
                email: 'e2e@test.in',
                accessRoles: [{ id: '1', label: 'Admin' }],
                contact: { id: '1', name: 'E2E User', phone: '911111111111' },
                groups: [],
                organization: { id: '1', contact: { phone: '911111111111' } },
                language: { id: '1', locale: 'en' },
              },
            },
          });
        case 'currentUserOrganisationLanguages':
          return data({
            currentUser: {
              user: {
                organization: {
                  activeLanguages: [{ id: '1', label: 'English', localized: true, locale: 'en' }],
                  defaultLanguage: { id: '1', label: 'English' },
                },
              },
            },
          });
        case 'Assistants':
          return data({ assistants: [] });
        case 'CountAssistants':
          return data({ countAssistants: 0 });
        case 'GeneratePrompt':
          return data({
            generatePrompt: {
              promptGeneration: { id: '1', status: 'in_progress', generatedPrompt: null, errorMessage: null },
              errors: null,
            },
          });
        case 'PromptGeneration':
          return data({
            promptGeneration: {
              promptGeneration: { id: '1', status: 'ready', generatedPrompt: GENERATED_PROMPT, errorMessage: null },
              errors: null,
            },
          });
        default:
          // permissive fallback for layout/bootstrap queries we don't care about
          return data({});
      }
    }
  );
};

test.beforeEach(async ({ page }) => {
  await seedAuthAndFlag(page);
  await mockNetwork(page);
});

test('generates a prompt and applies it to the assistant instructions', async ({ page }) => {
  await page.goto('/assistants');

  // open the create-assistant form where the prompt generator entry point lives
  await page.getByTestId('headingButton').click();
  await expect(page.getByTestId('generateWithAiButton')).toBeVisible();

  // open the generator
  await page.getByTestId('generateWithAiButton').click();
  await expect(page.getByTestId('betaBanner')).toBeVisible();

  // all 9 are mandatory — fill each by its unique placeholder
  for (const [placeholder, value] of ANSWERS) {
    await page.getByPlaceholder(placeholder).fill(value);
  }
  await expect(page.getByTestId('answeredCount')).toHaveText(/9\/9 answered/);

  // generate → poll → editable preview
  await page.getByTestId('generatePromptButton').click();
  await expect(page.getByTestId('reviewNotice')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('generatedPromptInput')).toHaveValue(GENERATED_PROMPT);

  // apply to the Instructions field
  await page.getByTestId('usePromptButton').click();
  await expect(page.getByTestId('betaBanner')).toBeHidden();
  await expect(page.getByText('Prompt added to Instructions')).toBeVisible();
});

test('blocks generation and flags gaps when answers are missing', async ({ page }) => {
  await page.goto('/assistants');
  await page.getByTestId('headingButton').click();
  await page.getByTestId('generateWithAiButton').click();
  await expect(page.getByTestId('betaBanner')).toBeVisible();

  await expect(page.getByTestId('answeredCount')).toHaveText(/0\/9 answered/);

  // clicking with everything blank must not start generating
  await page.getByTestId('generatePromptButton').click();
  await expect(page.getByTestId('generatingState')).toHaveCount(0);
  await expect(page.getByTestId('betaBanner')).toBeVisible();
});
