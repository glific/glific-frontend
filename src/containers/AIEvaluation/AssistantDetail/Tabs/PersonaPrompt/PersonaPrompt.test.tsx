import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import * as Notification from 'common/notification';
import { setOrganizationServices } from 'services/AuthService';
import type { KaapiModel, ModelConfig } from 'containers/AIEvaluation/types/assistantType';
import { parseKaapiModels } from '../../assistantModels';
import PersonaPrompt from './PersonaPrompt';

// the model field is a MUI Select — open it, then click the option
const pickModel = (label: string) => {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: label }));
};

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

// shaped exactly like kaapiModels: config arrives as a JSON string
export const rawModels = [
  {
    modelName: 'gpt-4.1',
    provider: 'openai',
    completionType: ['text'],
    config: JSON.stringify({
      max_output_tokens: { description: 'Max tokens in the response.', type: 'int', min: 1, max: 32768, default: 2048 },
      top_p: { description: 'Nucleus sampling.', type: 'float', min: 0, max: 1, default: 1 },
      temperature: { description: 'Controls randomness.', type: 'float', min: 0, max: 2, default: 1 },
    }),
  },
  {
    modelName: 'gpt-4o',
    provider: 'openai',
    completionType: ['text'],
    config: JSON.stringify({
      temperature: { description: 'Controls randomness.', type: 'float', min: 0, max: 2, default: 1 },
    }),
  },
  {
    modelName: 'gpt-5',
    provider: 'openai',
    completionType: ['text'],
    config: JSON.stringify({
      effort: {
        description: 'How long the model spends reasoning.',
        options: ['minimal', 'low', 'medium', 'high'],
        type: 'enum',
        default: 'medium',
      },
      summary: { description: 'Summarize the reasoning result.', options: ['auto'], type: 'enum', default: 'auto' },
    }),
  },
  {
    modelName: 'gpt-5.2-pro',
    provider: 'openai',
    completionType: ['text'],
    config: JSON.stringify({
      summary: { description: 'Summarize the reasoning result.', options: ['auto'], type: 'enum', default: 'auto' },
    }),
  },
  {
    // embeddings are not chat models and must never reach the dropdown
    modelName: 'text-embedding-3-large',
    provider: 'openai',
    completionType: [],
    config: '{}',
  },
];

const models: KaapiModel[] = parseKaapiModels(rawModels);

const renderTab = (config: Partial<ModelConfig> = {}, props: Record<string, unknown> = {}) => {
  const onConfigChange = vi.fn();
  const onPromptChange = vi.fn();
  render(
    <MockedProvider mocks={[]}>
      <PersonaPrompt
        prompt="You are a helpful assistant."
        config={{ model: 'gpt-4.1', temperature: '1', effort: '', verbosity: '', ...config }}
        models={models}
        onPromptChange={onPromptChange}
        onConfigChange={onConfigChange}
        {...props}
      />
    </MockedProvider>
  );
  return { onConfigChange, onPromptChange };
};

describe('reading the model list', () => {
  test('only chat models are offered — embeddings are filtered out', () => {
    expect(models.map((model) => model.modelName)).toEqual(['gpt-4.1', 'gpt-4o', 'gpt-5', 'gpt-5.2-pro']);
  });

  test('a config that will not parse leaves the model listed with no settings', () => {
    const parsed = parseKaapiModels([
      { modelName: 'broken', provider: 'openai', completionType: ['text'], config: 'not json' },
    ]);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].config).toEqual({});
  });
});

describe('settings follow the model', () => {
  test('a model with a temperature spec shows temperature only', () => {
    renderTab({ model: 'gpt-4.1' });

    expect(screen.getByTestId('temperatureInput')).toBeInTheDocument();
    expect(screen.queryByTestId('effortSegment')).not.toBeInTheDocument();
    expect(screen.queryByTestId('verbositySegment')).not.toBeInTheDocument();
  });

  test('a model with an effort spec shows effort and hides temperature', () => {
    renderTab({ model: 'gpt-5', effort: 'medium' });

    expect(screen.getByTestId('effortSegment')).toBeInTheDocument();
    expect(screen.queryByTestId('temperatureInput')).not.toBeInTheDocument();
  });

  test('the effort levels offered come from the model, not a fixed list', () => {
    renderTab({ model: 'gpt-5', effort: 'medium' });

    const options = screen.getByTestId('effortSegment').querySelectorAll('[role="radio"]');
    expect(Array.from(options).map((option) => option.textContent)).toEqual(['minimal', 'low', 'medium', 'high']);
  });

  test('the helper text is the description the API supplied', () => {
    renderTab({ model: 'gpt-5', effort: 'medium' });

    expect(screen.getByText('How long the model spends reasoning.')).toBeInTheDocument();
  });

  test('settings the tab does not render are ignored', () => {
    // gpt-5 also declares `summary`, and gpt-4.1 declares top_p and max_output_tokens
    renderTab({ model: 'gpt-4.1' });

    expect(screen.getByTestId('modelParams')).not.toHaveTextContent('top_p');
    expect(screen.getByTestId('modelParams')).not.toHaveTextContent('max_output_tokens');
  });

  test('a model with nothing tunable says so', () => {
    renderTab({ model: 'gpt-5.2-pro' });

    expect(screen.getByTestId('noModelParams')).toBeInTheDocument();
  });
});

describe('editing', () => {
  test('typing in the prompt reports upward', () => {
    const { onPromptChange } = renderTab();

    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'Be concise.' } });

    expect(onPromptChange).toHaveBeenCalledWith('Be concise.');
  });

  test('switching model applies that model defaults', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1', temperature: '1' });

    pickModel('gpt-5');

    // gpt-5 takes no temperature, and its effort default is medium
    expect(onConfigChange).toHaveBeenCalledWith({
      model: 'gpt-5',
      temperature: '',
      effort: 'medium',
      verbosity: '',
    });
  });

  test('switching away from a temperature model says why it disappeared', () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    renderTab({ model: 'gpt-4.1' });

    pickModel('gpt-5');

    expect(notificationSpy).toHaveBeenCalledWith(
      'This model does not take a temperature — use the settings it offers instead.'
    );
    notificationSpy.mockRestore();
  });

  test('picking an effort reports upward', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-5', effort: 'medium' });

    fireEvent.click(screen.getByText('high'));

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ effort: 'high' }));
  });

  test('editing temperature reports upward', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '0.4' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '0.4' }));
  });

  test('temperature is capped at the max the model declares', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '5' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '2' }));
  });

  test('temperature cannot go below the min the model declares', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '-3' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '0' }));
  });

  test('clearing temperature reports an empty value rather than 0', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '' }));
  });

  test('a partly typed value is left alone so it can be finished', () => {
    const { onConfigChange } = renderTab({ model: 'gpt-4.1' });

    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '0.0' } });

    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '0.0' }));
  });
});

describe('prompt generator', () => {
  test('is hidden when the org service is off', () => {
    setOrganizationServices(JSON.stringify({ promptGeneratorEnabled: false }));
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
