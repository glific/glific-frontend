import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import { SheetIntegration } from './SheetIntegration';
import {
  getSearchSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
} from 'mocks/Sheet';

const mocks = [
  getSearchSheetQuery,
  getSheetQuery,
  getSheetQuery,
  deleteSheetQuery,
  createSheetQuery,
  getSheetCountQuery,
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
      target: { value: 'NIRMAL' },
    });
    const button = getByText('Save');
    fireEvent.click(button);
    expect(getByText('Sheet integration')).toBeInTheDocument();
  });
});
