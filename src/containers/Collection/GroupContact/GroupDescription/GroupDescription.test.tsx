import React from 'react';
import { render } from '@testing-library/react';
import { GroupDescription } from './GroupDescription';

const defaultProps = {
  users: [{ id: 1, name: 'Default User' }],
  description: 'Default group',
};

const wrapper = <GroupDescription {...defaultProps}></GroupDescription>;

it('should render GroupDescription', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('groupDescription')).toBeInTheDocument();
});
