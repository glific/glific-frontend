import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SheetIntegration } from './SheetIntegration';
import {
  getSearchSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
  updateSheetQuery,
} from 'mocks/Sheet';

const mocks = [
  getSearchSheetQuery,
  getSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
  updateSheetQuery,
];

const sheetIntegration = () => (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SheetIntegration />
    </MockedProvider>
  </MemoryRouter>
);

it('should render SheetIntegration', async () => {
  const wrapper = render(sheetIntegration());
  await waitFor(() => {
    expect(wrapper.container).toBeInTheDocument();
  });
});

test('sheet succesfully created and list page should open ', async () => {
  const { getByText, getByTestId } = render(sheetIntegration());

  await waitFor(() => {
    const urlInput = getByTestId('formLayout').querySelector('input[name="url"]');
    const labelInput = getByTestId('formLayout').querySelector('input[name="label"]');

    expect(urlInput).not.toBeNull();
    expect(urlInput).toBeInTheDocument();
    expect(labelInput).not.toBeNull();
    expect(labelInput).toBeInTheDocument();

    fireEvent.change(urlInput!, {
      target: {
        value:
          'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6L9eu5zCfiCQiULhy_yrw7VYDoMDnb8pNi3E4l226iH865Z8Nv-6XWaZ-CStITlT3EmiCZ_RnHzof/pub?gid=0&single=true&output=csv',
      },
    });
    fireEvent.change(labelInput!, {
      target: { value: 'Sample sheet' },
    });
    const button = getByText('Save');
    fireEvent.click(button);
    expect(getByText('Google sheet')).toBeInTheDocument();
  });
});

test('edit sheet', async () => {
  const { getByText, getByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={['/sheet-integration/28/edit']}>
        <Routes>
          <Route path="sheet-integration/:id/edit" element={<SheetIntegration />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(getByTestId('formLayout').querySelector('input[name="url"]')).toHaveValue(
      'https://docs.google.com/spreadsheets/d/1fRpFyicqrUFxd7scvdGC8UOHEtAT3rA-G2i4tvOgScw/edit'
    );
    expect(getByTestId('formLayout').querySelector('input[name="label"]')).toHaveValue('Sheet 1');
  });

  const labelInput = getByTestId('formLayout').querySelector('input[name="label"]');
  fireEvent.change(labelInput!, {
    target: { value: 'Sample sheet 1' },
  });
  const button = getByText('Save');
  fireEvent.click(button);

  await waitFor(() => {
    expect(getByText('Google sheet')).toBeInTheDocument();
  });
});
