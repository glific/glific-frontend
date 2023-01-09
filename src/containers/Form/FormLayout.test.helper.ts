import * as Yup from 'yup';

import { Input } from 'components/UI/Form/Input/Input';

import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { CREATE_FLOW, DELETE_FLOW, UPDATE_FLOW } from 'graphql/mutations/Flow';
import { Checkbox } from 'components/UI/Form/Checkbox/Checkbox';
import { GET_FLOW } from 'graphql/queries/Flow';

const FormSchema = Yup.object();

export const listItemProps = {
  deleteItemQuery: DELETE_FLOW,
  states: {
    isActive: true,
    isPinned: false,
    isBackground: false,
    name: 'Help flow',
    keywords: ['help'],
    ignoreKeywords: false,
    roles: [],
  },
  setStates: jest.fn(),
  setValidation: jest.fn(),
  listItemName: 'flow',
  dialogMessage: "You won't be able to use this flow again.",
  formFields: [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'Name',
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      placeholder: 'Keywords',
      helperText: 'Enter comma separated keywords that trigger this flow',
    },
    {
      component: Checkbox,
      name: 'ignoreKeywords',
      title: 'Ignore Keywords',
      info: {
        title:
          'If activated, users will not be able to change this flow by entering keyword for any other flow.',
      },
      darkCheckbox: true,
    },
    {
      component: Checkbox,
      name: 'isActive',
      title: 'Is active?',
      darkCheckbox: true,
    },
    {
      component: Checkbox,
      name: 'isPinned',
      title: 'Is pinned?',
      darkCheckbox: true,
      disabled: false,
    },
    {
      component: Checkbox,
      name: 'isBackground',
      title: 'Run this flow in the background',
      darkCheckbox: true,
    },
  ],
  redirectionLink: 'flow',
  listItem: 'flow',
  getItemQuery: GET_FLOW,
  createItemQuery: CREATE_FLOW,
  updateItemQuery: UPDATE_FLOW,
  validationSchema: FormSchema,
  icon: null,
  getLanguageId: Function,
};

export const LIST_ITEM_MOCKS = [...getOrganizationQuery, getOrganizationLanguagesQuery];
