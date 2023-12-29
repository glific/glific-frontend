import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';

import { FlowTranslation } from './FlowTranslation';

const flowTranslation = () => {
  return (
    <MockedProvider addTypename={false}>
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
});
