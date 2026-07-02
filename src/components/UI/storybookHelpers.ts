/**
 * Storybook control helpers shared across component stories.
 *
 * `hideControls` disables the Controls-panel editor for props that can't be
 * meaningfully edited through a form widget — callbacks (`Function`),
 * `ReactNode` children, Formik `field`/`form` plumbing, option arrays and
 * style objects. These props otherwise render a noisy, non-functional
 * "Set object" / "Set string" button. The prop stays documented; only the
 * useless control is removed.
 */
export const hideControls = (...names: string[]): Record<string, { control: false }> =>
  names.reduce((acc, name) => ({ ...acc, [name]: { control: false } }), {});
