import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import * as Notification from 'common/notification';
import { setOrganizationServices } from 'services/AuthService';
import { DEFAULT_MODEL_CONFIG, ModelConfig, getModelParams } from '../../assistantModels';
import PersonaPrompt from './PersonaPrompt';

vi.mock('containers/Assistants/CreateAssistant/PromptGeneratorModal', () => ({
  initialPromptAnswers: {},
  PromptGeneratorModal: ({ onApply, onClose }: { onApply: (text: string) => void; onClose: () => void }) => (
    <div data-testid="promptGeneratorStub">
      <button type="button" onClick={() => onApply('generated prompt')} data-testid="stubApply">
        apply
      </button>
      <button type="button" onClick={onClose} data-testid="stubClose">
        close
      </button>
    </div>
  ),
}));

const renderTab = (config: Partial<ModelConfig> = {}, props: any = {}) => {
  const onConfigChange = vi.fn();
  const onPromptChange = vi.fn();
  const { rerender } = render(
    <MockedProvider mocks={[]}>
      <PersonaPrompt
        prompt="You are a helpful assistant."
        config={{ ...DEFAULT_MODEL_CONFIG, ...config }}
        onPromptChange={onPromptChange}
        onConfigChange={onConfigChange}
        {...props}
      />
    </MockedProvider>
  );
  return { onConfigChange, onPromptChange, rerender };
};

beforeEach(() => {
  localStorage.removeItem('organizationServices');
});

describe('model settings mapping', () => {
  test('a standard model shows temperature only', () => {
    renderTab({ model: 'gpt-4.1' });

    expect(screen.getByTestId('temperatureInput')).toBeInTheDocument();
    expect(screen.queryByTestId('effortSegment')).not.toBeInTheDocument();
    expect(screen.queryByTestId('verbositySegment')).not.toBeInTheDocument();
  });

  test('a reasoning model shows effort and verbosity, and hides temperature', () => {
    renderTab({ model: 'gpt-5', effort: 'medium' });

    expect(screen.getByTestId('effortSegment')).toBeInTheDocument();
    expect(screen.getByTestId('verbositySegment')).toBeInTheDocument();
    expect(screen.queryByTestId('temperatureInput')).not.toBeInTheDocument();
  });

  test('only the effort levels the model accepts are offered', () => {
    renderTab({ model: 'o4-mini', effort: 'medium' });

    expect(screen.getByTestId('effortSegment-low')).toBeInTheDocument();
    expect(screen.getByTestId('effortSegment-high')).toBeInTheDocument();
    expect(screen.queryByTestId('effortSegment-minimal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('effortSegment-none')).not.toBeInTheDocument();
  });

  test('a model whose reasoning can be turned off gets temperature back at effort "none"', () => {
    renderTab({ model: 'gpt-5.1', effort: 'none' });

    expect(screen.getByTestId('temperatureInput')).toBeInTheDocument();
    expect(screen.getByTestId('effortSegment')).toBeInTheDocument();
  });

  test('the same model hides temperature again once reasoning is turned up', () => {
    renderTab({ model: 'gpt-5.1', effort: 'high' });

    expect(screen.queryByTestId('temperatureInput')).not.toBeInTheDocument();
  });

  test('getModelParams matches what the tab renders', () => {
    expect(getModelParams({ ...DEFAULT_MODEL_CONFIG, model: 'gpt-4o' })).toEqual({
      temperature: true,
      effort: false,
      verbosity: false,
    });
    expect(getModelParams({ ...DEFAULT_MODEL_CONFIG, model: 'gpt-5-mini' })).toEqual({
      temperature: false,
      effort: true,
      verbosity: true,
    });
    expect(getModelParams({ ...DEFAULT_MODEL_CONFIG, model: 'gpt-5.1', effort: 'none' })).toEqual({
      temperature: true,
      effort: true,
      verbosity: true,
    });
    // an id that is not in the table falls back to the first model rather than blowing up
    expect(getModelParams({ ...DEFAULT_MODEL_CONFIG, model: 'not-a-model' })).toEqual({
      temperature: true,
      effort: false,
      verbosity: false,
    });
  });
});

describe('editing', () => {
  test('typing in the prompt reports upward', () => {
    const { onPromptChange } = renderTab();

    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'Be concise.' } });

    expect(onPromptChange).toHaveBeenCalledWith('Be concise.');
  });

  test('switching to a reasoning model applies its default effort', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('modelSelect'), { target: { value: 'gpt-5' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ model: 'gpt-5', effort: 'medium' }));
  });

  test('gpt-5.1 defaults to no reasoning', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('modelSelect'), { target: { value: 'gpt-5.1' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ model: 'gpt-5.1', effort: 'none' }));
  });

  test('picking an effort reports upward', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-5', effort: 'medium' });

    fireEvent.click(screen.getByTestId('effortSegment-high'));

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ effort: 'high' }));
  });

  test('picking a verbosity reports upward', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-5', effort: 'medium' });

    fireEvent.click(screen.getByTestId('verbositySegment-low'));

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ verbosity: 'low' }));
  });

  test('editing temperature reports upward', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '0.5' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '0.5' }));
  });

  test('temperature is capped at 2', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });
    const input = screen.getByTestId('temperatureInput');

    expect(input).toHaveAttribute('max', '2');

    fireEvent.change(input, { target: { value: '3.5' } });
    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '2' }));

    fireEvent.change(input, { target: { value: '2' } });
    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '2' }));
  });

  test('temperature cannot go below 0', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '-1' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '0' }));
  });

  test('clearing temperature reports an empty value rather than 0', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '' }));
  });

  test('choosing "none" on a model that supports it announces temperature is back', () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { onConfigChange } = renderTab({ model: 'gpt-5.1', effort: 'high' });

    fireEvent.click(screen.getByTestId('effortSegment-none'));

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ effort: 'none' }));
    expect(notificationSpy).toHaveBeenCalledWith('Reasoning off — temperature is available again.');
    notificationSpy.mockRestore();
  });

  test('switching to a reasoning model warns that temperature is dropped', () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('modelSelect'), { target: { value: 'gpt-5' } });

    expect(notificationSpy).toHaveBeenCalledWith(
      'Temperature is not supported on reasoning models — use reasoning effort and verbosity.'
    );
    notificationSpy.mockRestore();
  });

  test('a partly typed value is left alone so it can be finished', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '0.0' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '0.0' }));
  });

  test('the blurb follows the selected model', () => {
    renderTab({ model: 'o4-mini' });

    expect(screen.getByTestId('modelBlurb')).toHaveTextContent('Compact reasoning model');
    expect(screen.getByTestId('modelParams')).toHaveTextContent('o4-mini');
  });
});

describe('prompt generator', () => {
  test('is hidden when the org service is off', () => {
    renderTab();

    expect(screen.queryByTestId('generateWithAiButton')).not.toBeInTheDocument();
  });

  test('is shown when the org service is on', () => {
    setOrganizationServices(JSON.stringify({ promptGeneratorEnabled: true }));
    renderTab();

    expect(screen.getByTestId('generateWithAiButton')).toBeInTheDocument();
  });

  test('opens the generator, and closing it leaves the prompt alone', () => {
    setOrganizationServices(JSON.stringify({ promptGeneratorEnabled: true }));
    const { onPromptChange } = renderTab();

    fireEvent.click(screen.getByTestId('generateWithAiButton'));
    expect(screen.getByTestId('promptGeneratorStub')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('stubClose'));

    expect(screen.queryByTestId('promptGeneratorStub')).not.toBeInTheDocument();
    expect(onPromptChange).not.toHaveBeenCalled();
  });

  test('applying a generated prompt writes it back and closes', () => {
    setOrganizationServices(JSON.stringify({ promptGeneratorEnabled: true }));
    const { onPromptChange } = renderTab();

    fireEvent.click(screen.getByTestId('generateWithAiButton'));
    fireEvent.click(screen.getByTestId('stubApply'));

    expect(onPromptChange).toHaveBeenCalledWith('generated prompt');
    expect(screen.queryByTestId('promptGeneratorStub')).not.toBeInTheDocument();
  });
});
