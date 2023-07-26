import { gql } from '@apollo/client';

export const GET_SHEET = gql`
  query Sheet($id: ID!) {
    sheet(id: $id) {
      sheet {
        id
        insertedAt
        autoSync
        isActive
        label
        type
        lastSyncedAt
        updatedAt
        url
      }
      errors {
        key
        message
      }
    }
  }
`;

export const GET_SHEETS = gql`
  query Sheets($filter: SheetFilter, $opts: Opts) {
    sheets(filter: $filter, opts: $opts) {
      id
      url
      type
      isActive
      autoSync
      label
      sheetDataCount
      lastSyncedAt
      insertedAt
      updatedAt
    }
  }
`;

export const GET_SHEET_COUNT = gql`
  query countSheets($filter: SheetFilter) {
    countSheets(filter: $filter)
  }
`;
