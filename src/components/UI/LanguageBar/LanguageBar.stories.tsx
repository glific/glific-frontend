import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LanguageBar } from './LanguageBar';

const meta: Meta<typeof LanguageBar> = {
  title: 'UI/LanguageBar',
  component: LanguageBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LanguageBar>;

const LanguageBarControlled = (args: any) => {
  const [selected, setSelected] = useState<string | null>(args.options[0] ?? null);
  return (
    <LanguageBar
      {...args}
      selectedLangauge={selected}
      onLanguageChange={(lang: string) => setSelected(lang)}
    />
  );
};

export const Default: Story = {
  render: (args) => <LanguageBarControlled {...args} />,
  args: {
    options: ['English', 'Hindi'],
    form: {},
  },
};

export const ThreeLanguages: Story = {
  render: (args) => <LanguageBarControlled {...args} />,
  args: {
    options: ['English', 'Hindi', 'Marathi'],
    form: {},
  },
};
