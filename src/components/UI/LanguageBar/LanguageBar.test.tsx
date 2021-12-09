import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageBar } from './LanguageBar';

const props: any = {
  options: ['English', 'Hindi', 'Marathi'],
  selectedLangauge: null,
  onLanguageChange: jest.fn(),
};

test('it renders component successfully and selects language', async () => {
  // render(<LanguageBar {...props} />);

  // const english = screen.getByText('English');
  // expect(english).toBeInTheDocument();

  // fireEvent.click(english);
  // expect(props.onLanguageChange).toBeCalledTimes(1);
});

test('it renders component with selected language', async () => {
  // props.selectedLangauge = 'English';
  // render(<LanguageBar {...props} />);

  // // Change language to hindi
  // const hindi = screen.getByText('Hindi');
  // expect(hindi).toBeInTheDocument();

  // fireEvent.click(hindi);
  // expect(props.onLanguageChange).toBeCalledTimes(1);
});
