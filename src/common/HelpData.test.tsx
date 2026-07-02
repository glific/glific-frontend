import { render, screen } from '@testing-library/react';

import 'i18n/config';
import { templateLanguageInfo } from './HelpData';

test('templateLanguageInfo renders the Green/Yellow/Red legend through real i18next translation', () => {
  render(<>{templateLanguageInfo.heading}</>);

  expect(screen.getByText('Green:')).toBeInTheDocument();
  expect(screen.getByText('Yellow:')).toBeInTheDocument();
  expect(screen.getByText('Red:')).toBeInTheDocument();
});
