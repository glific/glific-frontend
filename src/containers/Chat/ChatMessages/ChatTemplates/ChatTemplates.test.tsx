import { MockedProvider } from '@apollo/client/testing';
import ChatTemplates from './ChatTemplates';
import { TEMPLATE_MOCKS } from '../../../../mocks/Template';
import { render, fireEvent, waitFor } from '@testing-library/react';

const mocks = TEMPLATE_MOCKS;

describe('<ChatTemplates />', () => {
  let defaultProps = {
    searchVal: '',
    handleSelectText: vi.fn(),
    isTemplate: false,
    isInteractiveMsg: false,
  };

  beforeEach(() => {
    defaultProps = {
      searchVal: '',
      handleSelectText: vi.fn(),
      isTemplate: false,
      isInteractiveMsg: false,
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
    expect(render(chatTemplates())).toBeTruthy();
  });

  test('mock API returns correct payload', async () => {
    // Check isHsm is false
    const { getByText: getByTextSpeedSend, getAllByTestId } = render(chatTemplates());
    await waitFor(() => {
      expect(getAllByTestId('templateItem')[0]).toBeTruthy();
    });

    expect(getByTextSpeedSend('Message:')).toBeInTheDocument();
    expect(getByTextSpeedSend('some description')).toBeInTheDocument();

    // Check isHsm is true
    defaultProps.isTemplate = true;
    const { getByText: getByTextTemplate } = render(chatTemplates());
    await waitFor(() => {
      expect(getByTextTemplate('Good message:')).toBeInTheDocument();
      expect(getByTextTemplate('Hey there')).toBeInTheDocument();
    });
  });

  test('no results should return text', async () => {
    defaultProps.searchVal = 'hi';
    const wrapper = render(chatTemplates());
    await waitFor(() => {
      expect(wrapper.getByTestId('no-results')).toBeTruthy();
    });
  });

  test('onClick of text should trigger handleSelectText', async () => {
    const wrapper = render(chatTemplates());
    await waitFor(() => {
      const shortcutItem = wrapper.getAllByTestId('templateItem')[0];
      fireEvent.click(shortcutItem);
    });

    expect(defaultProps.handleSelectText).toHaveBeenCalled();
  });
});
