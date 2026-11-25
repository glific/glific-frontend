import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { ContactHistory } from './ContactHistory';
import { contactHistoryQuery, countContactHistoryQuery, contactHistoryQueryUpdatedOffset } from 'mocks/Contact';
import { MemoryRouter } from 'react-router';
import { COUNT_CONTACT_HISTORY, GET_CONTACT_HISTORY } from 'graphql/queries/Contact';

export const mocks = [contactHistoryQuery, countContactHistoryQuery, contactHistoryQueryUpdatedOffset];
const defaultProps = {
  contactId: '1',
};

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactHistory {...defaultProps} />
    </MockedProvider>
  </MemoryRouter>
);

it('should render Contact History', async () => {
  const { getByText, getByTestId } = render(wrapper);
  expect(getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Date and Time')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Removed from collection: "Optout contacts"')).toBeInTheDocument();
  });
});

describe('channels on history entries (#5877)', () => {
  const entry = (id: string, eventType: string, eventLabel: string, channel: string | null, eventMeta = '{}') => ({
    id,
    channel,
    eventType,
    eventLabel,
    eventMeta,
    eventDatetime: '2026-11-08T06:50:32Z',
    insertedAt: '2026-11-08T06:50:33.000000Z',
    updatedAt: '2026-11-08T06:50:33.000000Z',
  });

  const flowMeta = '{"flow":{"uuid":"8c78ffd7","name":"Registration","id":14}}';

  const channelMocks = [
    {
      request: {
        query: GET_CONTACT_HISTORY,
        variables: {
          filter: { contactId: '2' },
          opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'inserted_at' },
        },
      },
      result: {
        data: {
          contactHistory: [
            entry('1', 'contact_flow_started', 'Flow Started', 'WEB', flowMeta),
            entry('2', 'contact_flow_ended_all', 'Last Active flow is terminated', null),
            entry('3', 'web_login_code_verified', 'Logged into web', 'WEB'),
            entry('4', 'contact_groups_updated', 'Added to collection', null),
            entry('5', 'contact_opted_in', 'Opted in on WhatsApp', 'WHATSAPP'),
          ],
        },
      },
    },
    {
      request: { query: COUNT_CONTACT_HISTORY, variables: { filter: { contactId: '2' } } },
      result: { data: { countContactHistory: 5 } },
    },
  ];

  const setWebChannel = (enabled: boolean) =>
    localStorage.setItem('organizationServices', JSON.stringify({ webChannelEnabled: enabled }));

  afterEach(() => localStorage.removeItem('organizationServices'));

  const renderHistory = () =>
    render(
      <MemoryRouter>
        <MockedProvider mocks={channelMocks} addTypename={false}>
          <ContactHistory contactId="2" />
        </MockedProvider>
      </MemoryRouter>
    );

  it('shows no channel when web channel is not enabled', async () => {
    setWebChannel(false);
    const { findByText, queryByTestId } = renderHistory();

    expect(await findByText('Logged into web')).toBeInTheDocument();
    expect(queryByTestId('historyChannel')).not.toBeInTheDocument();
  });

  it('shows the channel on every entry that has one', async () => {
    setWebChannel(true);
    const { findByText, getAllByTestId } = render(
      <MemoryRouter>
        <MockedProvider mocks={channelMocks} addTypename={false}>
          <ContactHistory contactId="2" />
        </MockedProvider>
      </MemoryRouter>
    );

    expect(await findByText('Registration')).toBeInTheDocument();
    expect(await findByText('Logged into web')).toBeInTheDocument();

    const chips = getAllByTestId('historyChannel').map((chip) => chip.textContent);
    expect(chips).toEqual(['Web', 'Web', 'WhatsApp']);
  });
});
