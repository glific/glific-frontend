import { fireEvent, render, screen } from '@testing-library/react';

import { ContactDescription } from './ContactDescription';

const defaultProps = {
  fields: '{"name":{"value":"hey","type":"string","label":"Name","inserted_at":"2021-08-04T11:00:33.693233Z"}}',
  phone: '9987399299',
  maskedPhone: '9987399299',
  settings: '{"Status":"Active"}',
  collections: [{ id: 1, label: 'Default Collection', users: [{ name: 'Glific' }] }],
  lastMessage: '',
  statusMessage: '',
};

const propsWithMultipleCollections = {
  fields: {},
  settings: {},
  phone: '9987399299',
  maskedPhone: '9987399299',
  collections: [
    { id: 1, label: 'Default Collection', users: [{ name: 'Glific' }] },
    { id: 2, label: 'Poetry Collection', users: [{ name: 'Admin' }] },
    { id: 2, label: 'Staff Collection', users: [{ name: 'Staff manager' }] },
  ],
  lastMessage: '',
  statusMessage: '',
};

const wrapper = <ContactDescription {...defaultProps}></ContactDescription>;

it('should render ContactDescription', () => {
  const { getByTestId, container } = render(wrapper);
  expect(getByTestId('contactDescription')).toBeInTheDocument();
  // toggle phone visibility

  const togglePhone = screen.getByRole('button');
  fireEvent.click(togglePhone);
});

test('it should display contact number', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('phone')).toHaveTextContent('+9987399299');
});

test('it should display contact collections', () => {
  const { getAllByTestId } = render(wrapper);
  expect(getAllByTestId('collections')[0]).toHaveTextContent('Default Collection');
});

test('it should display multiple collections properly', () => {
  const { getAllByTestId } = render(<ContactDescription {...propsWithMultipleCollections}></ContactDescription>);
  expect(getAllByTestId('collections')[0]).toHaveTextContent('Default Collection, Poetry Collection, Staff Collection');
});

describe('identities', () => {
  test('it should list each identity with its channel label', () => {
    render(
      <ContactDescription
        {...defaultProps}
        identities={[
          { id: '1', channel: 'WHATSAPP', identifier: '919876543210' },
          { id: '2', channel: 'WEB', identifier: 'ravi_web' },
        ]}
      />
    );

    expect(screen.getByText('Identities')).toBeInTheDocument();
    const identities = screen.getAllByTestId('identity');
    expect(identities).toHaveLength(2);
    expect(identities[0]).toHaveTextContent('WhatsApp919876543210');
    expect(identities[1]).toHaveTextContent('Webravi_web');
  });

  test('it should not render the identities block when the list is empty', () => {
    render(<ContactDescription {...defaultProps} identities={[]} />);

    expect(screen.queryByTestId('identities')).not.toBeInTheDocument();
    expect(screen.queryByText('Identities')).not.toBeInTheDocument();
  });

  test('it should not render the identities block for groups', () => {
    render(
      <ContactDescription
        {...defaultProps}
        groups
        identities={[{ id: '1', channel: 'WHATSAPP', identifier: '919876543210' }]}
      />
    );

    expect(screen.queryByTestId('identities')).not.toBeInTheDocument();
  });

  test('it should render a web-only contact without a phone value', () => {
    render(
      <ContactDescription
        {...defaultProps}
        phone={undefined}
        maskedPhone={undefined}
        identities={[{ id: '2', channel: 'WEB', identifier: 'ravi_web' }]}
      />
    );

    expect(screen.getByTestId('phone')).toHaveTextContent(/^-$/);
    expect(screen.queryByTestId('phoneToggle')).not.toBeInTheDocument();
    expect(screen.getByTestId('identity')).toHaveTextContent('Webravi_web');
  });

  test('it should keep showing the masked phone when the plain phone is withheld', () => {
    render(<ContactDescription {...defaultProps} phone="" maskedPhone="91987******10" identities={[]} />);

    expect(screen.getByTestId('phone')).toHaveTextContent('+91987******10');
    expect(screen.queryByTestId('phoneToggle')).not.toBeInTheDocument();
  });
});
