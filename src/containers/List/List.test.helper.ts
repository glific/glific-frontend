import { FILTER_ORGANIZATIONS, GET_ORGANIZATION_COUNT } from 'graphql/queries/Organization';
import { DELETE_INACTIVE_ORGANIZATIONS } from 'graphql/mutations/Organization';
import {
  getOrganizationLanguagesQuery,
  getOrganizationQuery,
  getAllOrganizations,
} from 'mocks/Organization';
import { getCurrentUserQuery } from 'mocks/User';
import { FILTER_FLOW, GET_FLOW_COUNT } from 'graphql/queries/Flow';
import { DELETE_FLOW } from 'graphql/mutations/Flow';
import {
  filterFlowQuery,
  filterFlowSortQuery,
  filterFlowWithNameOrKeywordOrTagQuery,
  getFlowCountQuery,
  getFlowCountWithFilterQuery,
} from 'mocks/Flow';
import { getFilterTagQuery } from 'mocks/Tag';
import { getRoleNameQuery } from 'mocks/Role';

export const defaultProps = {
  columnNames: [
    { name: 'is_pinned', label: '', sort: true, order: 'desc' },
    { name: 'name', label: 'Title' },
    { label: 'Last published' },
    { label: 'Last saved in Draft' },
    { label: 'Actions' },
  ],
  countQuery: GET_FLOW_COUNT,
  listItem: 'flows',
  filterItemsQuery: FILTER_FLOW,
  deleteItemQuery: DELETE_FLOW,
  listItemName: 'flow',
  searchParameter: ['name_or_keyword_or_tags'],
  dialogMessage: 'are you sure?',
  pageLink: 'flow',
  columns: (listItem: any) => ({}),
  listIcon: null,
  columnStyles: [],
  title: 'Flows',
  searchMode: true,
  filters: { isActive: true },
  button: { show: true, label: 'Create Flow', symbol: '+' },
};

export const LIST_MOCKS = [
  getCurrentUserQuery,
  filterFlowQuery,
  getFlowCountQuery({ isTemplate: false, isActive: true }),
  filterFlowQuery,
  filterFlowSortQuery,
  getFlowCountQuery({ isTemplate: false, isActive: true }),
  filterFlowWithNameOrKeywordOrTagQuery,
  getFlowCountWithFilterQuery,
  getCurrentUserQuery,
  getFilterTagQuery,
  getRoleNameQuery,
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
];

export const ORG_LIST_MOCK = [...getAllOrganizations, ...getAllOrganizations];

export const orgProps = {
  columnNames: [
    { name: 'name', label: 'Name' },
    { name: 'status', label: 'Status' },
    { label: 'Actions' },
  ],
  countQuery: GET_ORGANIZATION_COUNT,
  listItem: 'organizations',
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: DELETE_INACTIVE_ORGANIZATIONS,
  listItemName: 'organization',
  pageLink: 'organization',
  columns: (listItem: any) => ({}),
  listIcon: null,
  columnStyles: [],
  title: 'Organizations',
  searchMode: true,
};
