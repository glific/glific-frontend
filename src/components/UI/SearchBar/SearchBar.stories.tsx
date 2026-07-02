import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { hideControls } from '../storybookHelpers';
import { SearchBar } from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'UI/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  argTypes: {
    searchVal: { control: 'text' },
    searchMode: { control: 'boolean' },
    iconFront: { control: 'boolean' },
    ...hideControls(
      'handleChange',
      'handleSubmit',
      'onReset',
      'handleClick',
      'endAdornment',
      'className',
      'searchParam'
    ),
  },
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

const SearchBarControlled = (args: any) => {
  const [searchMode, setSearchMode] = useState(args.searchMode ?? false);
  const [searchVal, setSearchVal] = useState(args.searchVal ?? '');

  return (
    <SearchBar
      {...args}
      searchMode={searchMode}
      searchVal={searchVal}
      handleChange={(e: any) => {
        setSearchVal(e.target.value);
        setSearchMode(true);
      }}
      onReset={() => {
        setSearchVal('');
        setSearchMode(false);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <SearchBarControlled {...args} />,
};

export const WithIconFront: Story = {
  render: (args) => <SearchBarControlled {...args} />,
  args: { iconFront: true },
};

export const WithExistingValue: Story = {
  render: (args) => <SearchBarControlled {...args} />,
  args: {
    searchMode: true,
    searchVal: 'John',
  },
};
