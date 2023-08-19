import { GET_SHEET, GET_SHEETS, GET_SHEET_COUNT } from 'graphql/queries/Sheet';
import { DELETE_SHEET, CREATE_SHEET, SYNC_SHEET } from 'graphql/mutations/Sheet';

export const getSheetCountQuery = {
  request: {
    query: GET_SHEET_COUNT,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countSheets: 3,
    },
  },
};
export const getSearchSheetQuery = {
  request: {
    query: GET_SHEET,
    variables: { id: '28' },
  },
  result: {
    data: {
      sheet: {
        sheet: {
          __typename: 'Sheet',
          id: '28',
          insertedAt: '2022-10-16T14:54:55.000000Z',
          isActive: true,
          lastSyncedAt: '2022-10-16T14:54:54Z',
          updatedAt: '2022-10-16T14:54:55.000000Z',
          url: 'https://glific.test:8080/Sheet-integration/add',
        },
      },
    },
  },
};

export const getSheetQuery = {
  request: {
    query: GET_SHEETS,
    variables: {
      filter: {},
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
  },
  result: {
    data: {
      sheets: [
        {
          id: '1',
          insertedAt: '2022-10-16T14:54:55.000000Z',
          isActive: true,
          label: 'Sheet1',
          sheetDataCount: 4,
          type: 'READ',
          autoSync: false,
          lastSyncedAt: '2022-10-16T14:54:54Z',
          updatedAt: '2022-10-16T14:54:55.000000Z',
          url: 'https://glific.test:8080/Sheet-integration/add',
        },
        {
          id: '2',
          insertedAt: '2022-10-16T14:54:55.000000Z',
          isActive: true,
          label: 'Sheet2',
          sheetDataCount: 4,
          type: 'READ',
          autoSync: false,
          lastSyncedAt: '2022-10-16T14:54:54Z',
          updatedAt: '2022-10-16T14:54:55.000000Z',
          url: 'https://glific.test:8080/Sheet-integration/add',
        },
      ],
    },
  },
};

export const deleteSheetQuery = {
  request: {
    query: DELETE_SHEET,
    variables: { sheetId: '3' },
  },
  result: {
    data: {
      deleteSheet: {
        errors: null,
        sheet: null,
      },
    },
  },
};

export const createSheetQuery = {
  request: {
    query: CREATE_SHEET,
    variables: {
      input: {
        label: 'Sample sheet',
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6L9eu5zCfiCQiULhy_yrw7VYDoMDnb8pNi3E4l226iH865Z8Nv-6XWaZ-CStITlT3EmiCZ_RnHzof/pub?gid=0&single=true&output=csv',
        type: 'READ',
        autoSync: false,
      },
    },
  },
  result: {
    data: {
      createSheet: {
        sheet: {
          id: '3',
          insertedAt: '2022-10-14T06:06:23.141322Z',
          isActive: true,
          type: 'READ',
          label: 'sheet1',
          sheetDataCount: 4,
          lastSyncedAt: '2022-10-14T06:06:23Z',
          updatedAt: '2022-10-14T06:06:23.141322Z',
          url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6L9eu5zCfiCQiULhy_yrw7VYDoMDnb8pNi3E4l226iH865Z8Nv-6XWaZ-CStITlT3EmiCZ_RnHzof/pub?gid=0&single=true&output=csv',
        },
        errors: null,
      },
    },
  },
};

export const syncSheetMutation = {
  request: {
    query: SYNC_SHEET,
    variables: { id: '1' },
  },
  result: {
    data: {
      syncSheet: {
        sheet: {
          id: '3',
          insertedAt: '2022-10-14T06:06:23.141322Z',
          isActive: true,
          sheetDataCount: 4,
          label: 'sheet1',
          lastSyncedAt: '2022-10-14T06:06:23Z',
          updatedAt: '2022-10-14T06:06:23.141322Z',
          url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6L9eu5zCfiCQiULhy_yrw7VYDoMDnb8pNi3E4l226iH865Z8Nv-6XWaZ-CStITlT3EmiCZ_RnHzof/pub?gid=0&single=true&output=csv',
          warnings: '{}',
        },
        errors: null,
      },
    },
  },
};
