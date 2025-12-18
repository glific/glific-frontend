import { Screen, ContentItem } from './FormBuilder.types';

const getWhatsAppComponentType = (contentType: string, contentName: string): string => {
  // Text types
  if (contentType === 'Text') {
    switch (contentName) {
      case 'Large Heading':
        return 'TextHeading';
      case 'Small Heading':
        return 'TextSubheading';
      case 'Caption':
        return 'TextCaption';
      case 'Body':
        return 'TextBody';
      default:
        return 'TextBody';
    }
  }

  // Text Answer types
  if (contentType === 'Text Answer') {
    switch (contentName) {
      case 'Short Answer':
        return 'TextInput';
      case 'Paragraph':
        return 'TextArea';
      case 'Date Picker':
        return 'DatePicker';
      default:
        return 'TextInput';
    }
  }

  // Selection types
  if (contentType === 'Selection') {
    switch (contentName) {
      case 'Single Choice':
        return 'RadioButtonsGroup';
      case 'Multiple Choice':
        return 'CheckboxGroup';
      case 'Dropdown':
        return 'Dropdown';
      case 'Opt In':
        return 'OptIn';
      default:
        return 'RadioButtonsGroup';
    }
  }

  // Media types
  if (contentType === 'Media') {
    return 'Image';
  }

  return 'TextBody';
};

const convertContentItemToComponent = (item: ContentItem): any => {
  const componentType = getWhatsAppComponentType(item.type, item.name);
  const { data } = item;

  if (['TextHeading', 'TextSubheading', 'TextCaption', 'TextBody'].includes(componentType)) {
    return {
      text: data.text || 'Text',
      type: componentType,
    };
  }

  const generateUniqueName = (baseLabel: string) => {
    const baseName = baseLabel?.replace(/\s+/g, '_') || 'field';
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${randomId}`;
  };

  if (componentType === 'TextInput') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      'input-type': data.inputType?.toLowerCase() || 'text',
      label: data.label || 'Label',
      name: fieldName,
      required: data.required || false,
      type: 'TextInput',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'TextArea') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      label: data.label || 'Label',
      name: fieldName,
      required: data.required || false,
      type: 'TextArea',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'DatePicker') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      label: data.label || 'Label',
      name: fieldName,
      required: data.required || false,
      type: 'DatePicker',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'RadioButtonsGroup') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: `${index}_${opt.value || `Option_${index + 1}`}`,
        title: opt.value || `Option ${index + 1}`,
      })),
      label: data.label || 'Label',
      name: fieldName,
      required: data.required || false,
      type: 'RadioButtonsGroup',
    };
  }

  if (componentType === 'CheckboxGroup') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: `${index}_${opt.value || `Option_${index + 1}`}`,
        title: opt.value || `Option ${index + 1}`,
      })),
      label: data.label || 'Label',
      name: fieldName,
      required: data.required || false,
      type: 'CheckboxGroup',
    };
  }

  if (componentType === 'Dropdown') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: `${index}_${opt.value || `Option_${index + 1}`}`,
        title: opt.value || `Option ${index + 1}`,
      })),
      label: data.label || 'Label',
      name: fieldName,
      required: data.required || false,
      type: 'Dropdown',
    };
  }

  if (componentType === 'OptIn') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      label: data.label || 'Label',
      name: fieldName,
      required: data.required || false,
      type: 'OptIn',
    };
  }

  if (componentType === 'Image') {
    return {
      type: 'Image',
      src: data.text || '', 
    };
  }

  return null;
};

export const convertScreenToFlowJSON = (
  screen: Screen,
  screenIndex: number,
  totalScreens: number,
  nextScreenId?: string,
  accumulatedPayload: Record<string, string> = {}
): any => {
  const children: any[] = [];
  const formFieldNames: string[] = [];

  screen.content.forEach((item) => {
    const component = convertContentItemToComponent(item);
    if (component) {
      children.push(component);
      if (component.name) {
        formFieldNames.push(component.name);
      }
    }
  });

  const isTerminal = screenIndex === totalScreens - 1;

  if (screen.buttonLabel) {
    const currentScreenPayload: Record<string, string> = {};
    formFieldNames.forEach((fieldName, index) => {
      currentScreenPayload[`screen_${screenIndex}_${fieldName.split('_')[0]}_${index}`] = `\${form.${fieldName}}`;
    });

    const fullPayload: Record<string, string> = {};

    if (screenIndex > 0) {
      Object.keys(accumulatedPayload).forEach((key) => {
        fullPayload[key] = `\${data.${key}}`;
      });
    }

    Object.assign(fullPayload, currentScreenPayload);

    children.push({
      label: screen.buttonLabel,
      'on-click-action': isTerminal
        ? {
            name: 'complete',
            payload: fullPayload,
          }
        : {
            name: 'navigate',
            next: { name: nextScreenId || 'NEXT_SCREEN', type: 'screen' },
            payload: currentScreenPayload, 
          },
      type: 'Footer',
    });
  }

  const screenId = screen.name
    .toLowerCase()
    .replace(/\d+/g, (match) => {
      const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      return parseInt(match) < 10 ? numbers[parseInt(match)] : match;
    })
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();

  const screenData: Record<string, any> = {};
  if (screenIndex > 0) {
    Object.keys(accumulatedPayload).forEach((key) => {
      screenData[key] = {
        __example__: 'Example',
        type: 'string',
      };
    });
  }

  return {
    id: screenId,
    title: screen.name,
    terminal: isTerminal,
    data: screenData,
    layout: {
      type: 'SingleColumnLayout',
      children: [
        {
          type: 'Form',
          name: 'flow_path',
          children,
        },
      ],
    },
  };
};

export const convertFormBuilderToFlowJSON = (screens: Screen[]): any => {
  const totalScreens = screens.length;
  let accumulatedPayload: Record<string, string> = {};

  const flowScreens = screens.map((screen, index) => {
    const screenIds = screens.map((s) =>
      s.name
        .toLowerCase()
        .replace(/\d+/g, (match) => {
          const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
          return parseInt(match) < 10 ? numbers[parseInt(match)] : match;
        })
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim()
    );

    const nextScreenId = index < totalScreens - 1 ? screenIds[index + 1] : undefined;

    const flowScreen = convertScreenToFlowJSON(
      screen,
      index,
      totalScreens,
      nextScreenId,
      accumulatedPayload
    );

    screen.content.forEach((item) => {
      const component = convertContentItemToComponent(item);
      if (component && component.name) {
        const fieldIndex = Object.keys(accumulatedPayload).filter((k) => k.startsWith(`screen_${index}_`)).length;
        accumulatedPayload[`screen_${index}_${component.name.split('_')[0]}_${fieldIndex}`] = `\${form.${component.name}}`;
      }
    });

    return flowScreen;
  });

  return {
    version: '7.3',
    screens: flowScreens,
  };
};

export const generateFieldName = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') 
    .replace(/\s+/g, '_') 
    .trim();
};
