import { render, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';

import { FlowTranslation } from './FlowTranslation';
import { getFlowTranslations } from 'mocks/Flow';

const mocks = [getFlowTranslations];

const flowTranslation = () => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FlowTranslation flowId="1" setDialog={vi.fn()} />
    </MockedProvider>
  );
};

describe('Testing Translation flows', () => {
  it('should render <FlowTranslation>', async () => {
    const wrapper = render(flowTranslation());
    await waitFor(() => {
      expect(wrapper.container).toBeInTheDocument();
    });
  });

  it('should autotranslate', () => {
    const { getByText } = render(flowTranslation());

    const button = getByText('Submit');
    fireEvent.click(button);
  });
});
