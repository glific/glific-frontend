import { MockedProvider } from '@apollo/client/testing';
import { TriggerType } from './TriggerType';
import { fireEvent, render } from '@testing-library/react';

const handleOnChangeMock = vi.fn();
const setFieldValueMock = vi.fn();

const renderWrapper = (groupType: string) => {
  const props = {
    isWhatsAppGroupEnabled: true,
    handleOnChange: handleOnChangeMock,
    groupType,
    form: { dirty: '', touched: false, errors: null, setFieldValue: setFieldValueMock, values: {} },
  };
  return (
    <MockedProvider>
      <TriggerType {...props} />
    </MockedProvider>
  );
};

test('it should change the group type', async () => {
  const { getAllByTestId } = render(renderWrapper('WABA'));

  const radioButtons = getAllByTestId('radio-btn');

  fireEvent.click(radioButtons[1]);

  expect(handleOnChangeMock).toHaveBeenCalled();
  expect(setFieldValueMock).toHaveBeenCalled();
});
