import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { shallow } from 'enzyme';
import ChatTemplates from './ChatTemplates';
import { TEMPLATE_MOCKS } from '../../../../mocks/Template';
import { render, wait, fireEvent } from '@testing-library/react';

const mocks = TEMPLATE_MOCKS;

describe('<ChatTemplates />', () => {
  let defaultProps = {
    searchVal: '',
    handleSelectText: jest.fn(),
    isTemplate: false,
  };

  beforeEach(() => {
    defaultProps = {
      searchVal: '',
      handleSelectText: jest.fn(),
      isTemplate: false,
    };
  });

  const chatTemplates = () => {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatTemplates {...defaultProps} />
      </MockedProvider>
    );
  };

  test('it should render <ChatTemplates /> correctly', () => {
    expect(shallow(chatTemplates())).toBeTruthy();
  });

  test('mock API returns correct payload', async () => {
    // Check isHsm is false
    const { getByText: getByTextSpeedSend, getByTestId } = render(chatTemplates());
    await wait();
    expect(getByTestId('templateItem')).toBeTruthy();
    expect(getByTextSpeedSend('Message:')).toBeInTheDocument();
    expect(getByTextSpeedSend('some description')).toBeInTheDocument();

    // Check isHsm is true
    defaultProps.isTemplate = true;
    const { getByText: getByTextTemplate } = render(chatTemplates());
    await wait();
    expect(getByTextTemplate('Good message:')).toBeInTheDocument();
    expect(getByTextTemplate('Hey there')).toBeInTheDocument();
  });

  test('no results should return text', async () => {
    defaultProps.searchVal = 'this should not return anything';
    const wrapper = render(chatTemplates());
    await wait();
    expect(wrapper.getByTestId('no-results')).toBeTruthy();
  });

  test('onClick of text should trigger handleSelectText', async () => {
    const wrapper = render(chatTemplates());
    await wait();
    const shortcutItem = wrapper.getByTestId('templateItem');
    fireEvent.click(shortcutItem);
    expect(defaultProps.handleSelectText).toHaveBeenCalled();
  });
});
