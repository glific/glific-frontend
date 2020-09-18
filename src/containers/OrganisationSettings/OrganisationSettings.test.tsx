import React from 'react';
import { render, screen, fireEvent, wait, findByText } from '@testing-library/react';
import { OrganisationSettings } from './OrganisationSettings';
import { MockedProvider } from '@apollo/client/testing';
import { LIST_ITEM_MOCKS } from './OrganisationSettings.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <OrganisationSettings match={{ params: { id: 1 } }} />
  </MockedProvider>
);

describe('<OrganisationSettings />', () => {
  it('renders component properly', async () => {
    const { findByTestId } = render(wrapper);
    const container = await findByTestId('formLayout');
    expect(container).toHaveTextContent('Organisation name');
  });
});

describe('should load the <OrganisationSettings />', () => {
  test('should load the OrganisationSettings edit', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    expect(getByText('Settings')).toBeInTheDocument();
  });
});

describe('Check form fields <OrganisationSettings />', () => {
  test('Check label of fields', async () => {
    const { getByText, findByTestId } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    const container = await findByTestId('formLayout');
    expect(container).toHaveTextContent('Organisation name');
    expect(container).toHaveTextContent('Gupshup API key');
    expect(container).toHaveTextContent('Gupshup WhatsApp number');
    expect(container).toHaveTextContent('Active language(s)');
    expect(container).toHaveTextContent('Default language');
    expect(container).toHaveTextContent('Hours of operations');
    expect(container).toHaveTextContent('Opens');
    expect(container).toHaveTextContent('Closes');
    expect(container).toHaveTextContent('Select days');
    expect(container).toHaveTextContent('Select default flow');
  });
});

describe('Checked Hours of operations', () => {
  test('Checked Hours of operations', async () => {
    const { getByText, findByTestId } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
    const container = await findByTestId('formLayout');
    await wait();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.change(checkbox, { target: { value: 'true' } });
    expect(checkbox.value).toBe('true');
  });
});
