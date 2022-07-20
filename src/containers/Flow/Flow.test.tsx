import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { getFlowQuery, filterFlowQuery } from 'mocks/Flow';
import { Flow } from './Flow';

import * as routerDom from 'react-router-dom';

const mocks = [
  ...getOrganizationQuery,
  getFlowQuery,
  filterFlowQuery,
  getOrganizationLanguagesQuery,
];

const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
  useParams: () => ({ id: 1 }),
}));

const flow = () => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Flow />
    </MemoryRouter>
  </MockedProvider>
);

it('should render Flow', async () => {
  const wrapper = render(flow());
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

it('should support keywords in a separate language', async () => {
  const { container, getByText, findByText } = render(flow());

  await waitFor(() => {
    fireEvent.change(container.querySelector('input[name="name"]') as HTMLInputElement, {
      target: { value: 'New Flow' },
    });
    fireEvent.change(container.querySelector('input[name="keywords"]') as HTMLInputElement, {
      target: { value: 'मदद' },
    });
  });

  const button = getByText('Save');
  fireEvent.click(button);

  await waitFor(() => {});

  // testing if we don't have element for error message
  // expect(container.querySelectorAll('.MuiFormHelperText-root').length).toBe(1);
});

it('should not allow special characters in keywords', async () => {
  const { container, getByText } = render(flow());

  await waitFor(() => {
    fireEvent.change(container.querySelector('input[name="name"]') as HTMLInputElement, {
      target: { value: 'New Flow' },
    });
    fireEvent.change(container.querySelector('input[name="keywords"]') as HTMLInputElement, {
      target: { value: 'Hey&' },
    });
  });

  const button = getByText('Save');
  fireEvent.click(button);

  await waitFor(() => {
    // error if a special character is introduced in the keyword
    expect(getByText('Sorry, special characters are not allowed.'));
  });
});

it('should create copy of flow', async () => {
  mockUseLocationValue.state = 'copy';

  routerDom.useLocation = jest.fn(() => ({ state: 'copy', pathname: '/flow/1/edit' }));

  const copyFlow = () => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  const { container, getByTestId } = render(copyFlow());
  await waitFor(() => {
    const inputElement = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(inputElement?.value).toBe('Copy of Help');
  });

  fireEvent.change(container.querySelector('input[name="keywords"]') as HTMLInputElement, {
    target: { value: 'help, activity' },
  });
  const button = getByTestId('submitActionButton');
  fireEvent.click(button);
  await waitFor(() => {
    // error if a keyword with same flow already exists
    // expect(getByTestId('dialogTitle')).toBeInTheDocument();
    // expect(screen.getByTestId('dialogTitle')).toThrow(
    //   'The keyword `help` was already used in the `Help Workflow` Flow.'
    // );
  });
});

it('should edit the flow', async () => {
  const editFlow = () => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/flow/1/edit`]}>
        <Routes>
          <Route path="flow/:id/edit" element={<Flow />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
  const { container, getByTestId } = render(editFlow());
  await waitFor(() => {});
});
