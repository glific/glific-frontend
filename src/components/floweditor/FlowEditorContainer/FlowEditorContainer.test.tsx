import React from 'react';
import { mount } from 'enzyme';
import { FlowEditorContainer } from './FlowEditorContainer';
import { MemoryRouter } from 'react-router-dom';
import { GET_AUTOMATION } from '../../../graphql/queries/Automation';
import { MockedProvider } from '@apollo/client/testing';
import { FlowEditor } from '../FlowEditor';

const mocks = [
  {
    request: {
      query: GET_AUTOMATION,
      variables: {
        id: '1',
      },
    },
    result: {
      data: {
        flow: {
          flow: {
            id: '1',
            uuid: 'dnkdskknfknfiwee',
          },
        },
      },
    },
  },
];

const wrapper = mount(
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <FlowEditorContainer match={{ params: { id: '1' } }} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should contain the flowEditor', () => {
  expect(wrapper.exists()).toBe(true);
});

test('it should have a done button that redirects to automation page', () => {
  expect(wrapper.find('[data-testid="button"]').exists()).toBe(true);
});

test('it should have a help button that redirects to help page', () => {
  expect(wrapper.find('[data-testid="helpButton"]').exists()).toBe(true);
  wrapper.unmount();
});
