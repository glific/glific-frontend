import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { Organisation } from './Organisation';
import { MockedProvider } from '@apollo/client/testing';
import { LIST_ITEM_MOCKS } from '../SettingList.test.helper';
import { BrowserRouter as Router } from 'react-router-dom';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Organisation />
    </Router>
  </MockedProvider>
);

describe('<Organisation />', () => {
  it('renders component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Back to settings')).toBeInTheDocument();
    });
  });
});

describe('<Organisation />', () => {
  it('SAVE component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      const saveButton = screen.getByText('Save');
      UserEvent.click(saveButton);
    });
  });
});

describe('<Organisation />', () => {
  it('Click on Cancel', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      const Button = screen.getByText('Cancel');
      expect(Button).toBeInTheDocument();
      // click on Cancel
      UserEvent.click(Button);
    });
  });
});

describe('Checked Hours of operations', () => {
  test('Checked Hours of operations', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.change(checkbox, { target: { value: 'true' } });
      expect(checkbox.value).toBe('true');
    });
  });
});
