import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import * as Notification from 'common/notification';
import { setOrganizationServices } from 'services/AuthService';
import type { AssistantModel, ModelConfig } from 'containers/AIEvaluation/types/assistantType';
import { configForModel, parseAssistantModels } from '../../assistantModels';
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

const models: AssistantModel[] = parseAssistantModels(rawModels);

const renderTab = (config: Partial<ModelConfig> = {}, props: Record<string, unknown> = {}) => {
  const onConfigChange = vi.fn();
  const onPromptChange = vi.fn();
  render(
    <MockedProvider mocks={[]}>
      <PersonaPrompt
        prompt="You are a helpful assistant."
        config={{ model: 'gpt-4.1', temperature: '1', effort: '', ...config }}
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
    const parsed = parseAssistantModels([
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

describe('settings the API describes loosely', () => {
  // a spec may name a setting without pinning its range or its choices
  const looseModels = parseAssistantModels([
    {
      modelName: 'loose-temp',
      provider: 'openai',
      completionType: ['text'],
      config: JSON.stringify({ temperature: { description: 'Controls randomness.', type: 'float' } }),
    },
    {
      modelName: 'loose-effort',
      provider: 'openai',
      completionType: ['text'],
      config: JSON.stringify({ effort: { description: 'How hard it thinks.', type: 'enum' } }),
    },
    {
      modelName: 'chatty',
      provider: 'openai',
      completionType: ['text'],
      config: JSON.stringify({
        effort: { description: 'How hard it thinks.', options: ['low', 'high'], default: 'low' },
      }),
    },
  ]);

  test('a temperature with no declared range falls back to 0 and 2', () => {
    const { onConfigChange } = renderTab({ model: 'loose-temp', temperature: '1' }, { models: looseModels });

    const input = screen.getByTestId('temperatureInput');
    // the spec pins no range, so the field carries none either
    expect(input).not.toHaveAttribute('min');
    expect(input).not.toHaveAttribute('max');

    // typed values still land in the 0–2 range every model shares
    fireEvent.change(input, { target: { value: '5' } });
    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '2' }));

    fireEvent.change(input, { target: { value: '-1' } });
    expect(onConfigChange).toHaveBeenCalledWith(expect.objectContaining({ temperature: '0' }));
  });

  test('an effort with no declared options renders no choices', () => {
    renderTab({ model: 'loose-effort' }, { models: looseModels });

    expect(screen.getByTestId('effortSegment')).toBeInTheDocument();
    expect(screen.queryByTestId('effortSegment-low')).not.toBeInTheDocument();
  });

  test('moving between two models that both take a temperature says nothing', () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    renderTab({ model: 'gpt-4.1' });

    pickModel('gpt-4o');

    expect(notificationSpy).not.toHaveBeenCalled();
    notificationSpy.mockRestore();
  });
});

describe('reading what the API returned', () => {
  test('no models at all is not an error', () => {
    expect(parseAssistantModels()).toEqual([]);
    expect(parseAssistantModels(null)).toEqual([]);
  });

  test('a model with no completion type is not a chat model', () => {
    expect(parseAssistantModels([{ modelName: 'mystery', completionType: null, config: '{}' }])).toEqual([]);
  });

  test('a model with no config is offered with nothing to tune', () => {
    const [model] = parseAssistantModels([{ modelName: 'bare', completionType: ['text'], config: null }]);

    expect(model).toEqual({ modelName: 'bare', provider: '', config: {} });
  });

  test('configForModel leaves the config alone when there is no model', () => {
    const current = { model: 'gpt-4.1', temperature: '1', effort: '' };

    expect(configForModel(undefined, current)).toBe(current);
  });

  test('configForModel takes each default the model declares', () => {
    const [model] = parseAssistantModels([
      {
        modelName: 'defaults',
        completionType: ['text'],
        config: JSON.stringify({
          temperature: { default: 0.7 },
          effort: { default: 'high' },
        }),
      },
    ]);

    expect(configForModel(model, { model: '', temperature: '', effort: '' })).toEqual({
      model: 'defaults',
      temperature: '0.7',
      effort: 'high',
    });
  });
});
