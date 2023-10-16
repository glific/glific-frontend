import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { LOGGED_IN_USER_MOCK, LOGGED_IN_USER_MULTIPLE_PROFILES } from 'mocks/Contact';
import { ContactProfile } from './ContactProfile';
import { mocks as historyMock } from './ContactHistory/ContactHistory.test';
import { setOrganizationServices } from 'services/AuthService';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

describe('contact profile', () => {
  const mocks = [...LOGGED_IN_USER_MOCK, ...historyMock];

  const contactProfile = (
    <MemoryRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContactProfile />
      </MockedProvider>
    </MemoryRouter>
  );

  test('contact profile should render', async () => {
    const { getByText } = render(contactProfile);
    await waitFor(() => {
      expect(getByText('Profile')).toBeInTheDocument();
    });
  });
});

// Todo: Multiple profiles display

// describe('contact profile (multiple profile)', () => {
//   setOrganizationServices('{"contactProfileEnabled":true}');
//   const mocks = [...LOGGED_IN_USER_MULTIPLE_PROFILES, ...historyMock];

//   test('contact profile should render', async () => {
//     const { getByTestId } = render(
//       <MemoryRouter>
//         <MockedProvider mocks={mocks} addTypename={false}>
//           <ContactProfile />
//         </MockedProvider>
//       </MemoryRouter>
//     );
//     await waitFor(() => {
//       expect(getByTestId('ContactProfile')).toBeInTheDocument();
//     });
//   });
// });
