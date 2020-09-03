import React from 'react';
import { render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { shallow } from 'enzyme';
import { OrganisationSettings } from './OrganisationSettings';
import { MockedProvider } from '@apollo/client/testing';
import { LIST_ITEM_MOCKS } from './OrganisationSettings.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = shallow(
  <MockedProvider mocks={mocks} addTypename={false}>
    <OrganisationSettings match={{ params: { id: 1 } }} />
  </MockedProvider>
);

describe('<OrganisationSettings />', () => {
  it('should render OrganisationSettings', () => {
    expect(wrapper.exists()).toBe(true);
  });
});

test('should load the OrganisationSettings edit', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <OrganisationSettings match={{ params: { id: 1 } }} />
    </MockedProvider>
  );

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await wait();
  expect(getByText('Settings')).toBeInTheDocument();
});
