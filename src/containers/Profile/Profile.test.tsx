import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LOGGED_IN_USER_MOCK } from 'mocks/Contact';
import { Profile } from './Profile';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';

const mocks = LOGGED_IN_USER_MOCK;

const assignTags = {
  component: AutoComplete,
  name: 'tags',
  options: [],
  additionalState: 'tags',
  skipPayload: true,
  optionLabel: 'label',
  textFieldProps: {
    label: 'Assign tags',
    variant: 'outlined',
  },
};

const props: any = {
  profileType: 'User',
  redirectionLink: '/chat',
  additionalField: assignTags,
  additionalProfileStates: { name: 'tags', state: '', setState: jest.fn() },
};
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Profile match={{ params: { id: 1 } }} {...props} />
  </MockedProvider>
);

it('should render Profile page', async () => {
  const { container } = render(wrapper);

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

it('should render profile page for contact profile', async () => {
  props.removePhoneField = true;

  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Profile {...props} />
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
});
