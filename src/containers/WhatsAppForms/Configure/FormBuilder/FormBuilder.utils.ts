import { Screen, ContentItem } from './FormBuilder.types';

const generateScreenId = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\d+/g, (match) => {
      const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      return parseInt(match) < 10 ? numbers[parseInt(match)] : match;
    })
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();

export const hasContentItemError = (item: ContentItem): boolean => {
  const { data, type, name } = item;

  if (type === 'Text') {
    return !data.text || data.text.trim() === '';
  }

  if (type === 'Text Answer') {
    return !data.label || data.label.trim() === '';
  }

  if (type === 'Selection') {
    if (!data.label || data.label.trim() === '') return true;

    if (name !== 'Opt In') {
      if (!data.options || data.options.length === 0) return true;
      return data.options.some((opt) => !opt.value || opt.value.trim() === '');
    }
  }

  if (type === 'Media') {
    return !data.text || data.text.trim() === '';
  }

  return false;
};

export const hasScreenError = (screen: Screen): boolean => {
  const hasNameError = !screen.name || screen.name.trim() === '';
  const hasButtonLabelError = !screen.buttonLabel || screen.buttonLabel.trim() === '';
  return hasNameError || hasButtonLabelError;
};

export const hasFormErrors = (screens: Screen[]): boolean => {
  return screens.some((screen) => {
    if (hasScreenError(screen)) return true;
    return screen.content.some((item) => hasContentItemError(item));
  });
};

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

const generateFieldName = (variableName: string, baseLabel: string, screenIndex: number, fieldCounter: number) => {
  if (variableName && variableName.trim()) {
    return variableName.replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
  }

  const baseName = baseLabel.replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '') || `field_${fieldCounter}`;
  return `screen_${screenIndex}_${baseName}_${fieldCounter}`;
};

const convertContentItemToComponent = (item: ContentItem, screenIndex: number, fieldCounter: number): any => {
  const componentType = getWhatsAppComponentType(item.type, item.name);
  const { data } = item;

  if (['TextHeading', 'TextSubheading', 'TextCaption', 'TextBody'].includes(componentType)) {
    return {
      text: data.text,
      type: componentType,
    };
  }

  if (componentType === 'TextInput') {
    const fieldName = generateFieldName(data.variableName || '', data.label || '', screenIndex, fieldCounter);
    return {
      'input-type': data.inputType?.toLowerCase() || 'text',
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'TextInput',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'TextArea') {
    const fieldName = generateFieldName(data.variableName || '', data.label || '', screenIndex, fieldCounter);
    return {
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'TextArea',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'DatePicker') {
    const fieldName = generateFieldName(data.variableName || '', data.label || '', screenIndex, fieldCounter);
    return {
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'DatePicker',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'RadioButtonsGroup') {
    const fieldName = generateFieldName(data.variableName || '', data.label || '', screenIndex, fieldCounter);
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: `${index}_${opt.value}`,
        title: opt.value,
      })),
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'RadioButtonsGroup',
    };
  }

  if (componentType === 'CheckboxGroup') {
    const fieldName = generateFieldName(data.variableName || '', data.label || '', screenIndex, fieldCounter);
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: `${index}_${opt.value}`,
        title: opt.value,
      })),
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'CheckboxGroup',
    };
  }

  if (componentType === 'Dropdown') {
    const fieldName = generateFieldName(data.variableName || '', data.label || '', screenIndex, fieldCounter);
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: `${index}_${opt.value}`,
        title: opt.value,
      })),
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'Dropdown',
    };
  }

  if (componentType === 'OptIn') {
    const fieldName = generateFieldName(data.variableName || '', data.label || '', screenIndex, fieldCounter);
    return {
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'OptIn',
    };
  }

  if (componentType === 'Image') {
    return {
      type: 'Image',
      src: data.text?.split('base64,')[1] || '',
      height: 400,
      'scale-type': 'contain',
    };
  }

  return null;
};

const generateScreenData = (
  previousScreensComponentNames: Array<{ name: string; fieldType: string }>
): Record<string, any> => {
  const data: Record<string, any> = {};
  previousScreensComponentNames.forEach(({ name, fieldType }) => {
    if (fieldType === 'CheckboxGroup') {
      data[name] = {
        __example__: [],
        items: { type: 'string' },
        type: 'array',
      };
    } else if (fieldType === 'OptIn') {
      data[name] = {
        __example__: false,
        type: 'boolean',
      };
    } else {
      data[name] = {
        __example__: 'Example',
        type: 'string',
      };
    }
  });
  return data;
};

const generateScreenPayload = (
  componentsMap: Map<string, any>,
  screenContent: ContentItem[],
  previousScreensComponentNames: Array<{ name: string; fieldType: string }>
): Record<string, string> => {
  const payload: Record<string, string> = {};

  if (previousScreensComponentNames.length > 0) {
    previousScreensComponentNames.forEach(({ name }) => {
      payload[name] = `\${data.${name}}`;
    });
  }

  screenContent.forEach((item) => {
    if (item.type === 'Text Answer' || item.type === 'Selection') {
      const component = componentsMap.get(item.id);
      if (component && component.name) {
        payload[component.name] = `\${form.${component.name}}`;
      }
    }
  });

  return payload;
};

export const convertScreenToFlowJSON = (
  screen: Screen,
  screenIndex: number,
  totalScreens: number,
  nextScreenId?: string,
  previousScreensComponentNames: Array<{ name: string; fieldType: string }> = []
): any => {
  const children: any[] = [];
  const componentsMap: Map<string, any> = new Map();

  let fieldCounter = 0;
  screen.content.forEach((item) => {
    const component = convertContentItemToComponent(item, screenIndex, fieldCounter);
    if (component) {
      children.push(component);
      componentsMap.set(item.id, component);

      if (item.type === 'Text Answer' || item.type === 'Selection') {
        fieldCounter++;
      }
    }
  });

  const isTerminal = screenIndex === totalScreens - 1;

  const payload = generateScreenPayload(componentsMap, screen.content, previousScreensComponentNames);

  if (screen.buttonLabel) {
    children.push({
      label: screen.buttonLabel,
      'on-click-action': isTerminal
        ? {
            name: 'complete',
            payload,
          }
        : {
            name: 'navigate',
            next: { name: nextScreenId || 'NEXT_SCREEN', type: 'screen' },
            payload,
          },
      type: 'Footer',
    });
  }

  const screenId = generateScreenId(screen.name);

  const screenData = generateScreenData(previousScreensComponentNames);

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
  let previousScreensComponentNames: Array<{ name: string; fieldType: string }> = [];

  const flowScreens = screens.map((screen, index) => {
    const screenIds = screens.map((s) => generateScreenId(s.name));

    const nextScreenId = index < totalScreens - 1 ? screenIds[index + 1] : undefined;

    const flowScreen = convertScreenToFlowJSON(
      screen,
      index,
      totalScreens,
      nextScreenId,
      previousScreensComponentNames
    );

    let fieldCounter = 0;
    screen.content.forEach((item) => {
      if (item.type === 'Text Answer' || item.type === 'Selection') {
        const componentName = generateFieldName(
          item.data.variableName || '',
          item.data.label || '',
          index,
          fieldCounter
        );

        const componentType = getWhatsAppComponentType(item.type, item.name);
        previousScreensComponentNames.push({ name: componentName, fieldType: componentType });
        fieldCounter++;
      }
    });

    return flowScreen;
  });

  return {
    version: '7.3',
    screens: flowScreens,
  };
};

const getInternalComponentType = (whatsappType: string): { type: string; name: string } => {
  switch (whatsappType) {
    case 'TextHeading':
      return { type: 'Text', name: 'Large Heading' };
    case 'TextSubheading':
      return { type: 'Text', name: 'Small Heading' };
    case 'TextCaption':
      return { type: 'Text', name: 'Caption' };
    case 'TextBody':
      return { type: 'Text', name: 'Body' };
    case 'TextInput':
      return { type: 'Text Answer', name: 'Short Answer' };
    case 'TextArea':
      return { type: 'Text Answer', name: 'Paragraph' };
    case 'DatePicker':
      return { type: 'Text Answer', name: 'Date Picker' };
    case 'RadioButtonsGroup':
      return { type: 'Selection', name: 'Single Choice' };
    case 'CheckboxGroup':
      return { type: 'Selection', name: 'Multiple Choice' };
    case 'Dropdown':
      return { type: 'Selection', name: 'Dropdown' };
    case 'OptIn':
      return { type: 'Selection', name: 'Opt In' };
    case 'Image':
      return { type: 'Media', name: 'Image' };
    default:
      return { type: 'Text', name: 'Body' };
  }
};

const convertWhatsAppComponentToContentItem = (component: any, order: number): ContentItem | null => {
  const { type } = component;

  if (type === 'Footer') {
    return null;
  }

  const internalType = getInternalComponentType(type);
  const contentItem: ContentItem = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    type: internalType.type,
    name: internalType.name,
    order,
    data: {},
  };

  if (['TextHeading', 'TextSubheading', 'TextCaption', 'TextBody'].includes(type)) {
    contentItem.data = {
      text: component.text || '',
    };
    return contentItem;
  }

  if (type === 'TextInput') {
    contentItem.data = {
      label: component.label || '',
      inputType: component['input-type'] || 'text',
      required: component.required || false,
      placeholder: component['helper-text'] || '',
    };
    return contentItem;
  }

  if (type === 'TextArea') {
    contentItem.data = {
      label: component.label || '',
      required: component.required || false,
      placeholder: component['helper-text'] || '',
    };
    return contentItem;
  }

  if (type === 'DatePicker') {
    contentItem.data = {
      label: component.label || '',
      required: component.required || false,
      placeholder: component['helper-text'] || '',
    };
    return contentItem;
  }

  if (['RadioButtonsGroup', 'CheckboxGroup', 'Dropdown'].includes(type)) {
    const dataSource = component['data-source'] || [];
    contentItem.data = {
      label: component.label || '',
      required: component.required || false,
      options: dataSource.map((item: any, index: number) => ({
        id: item.id || `${index}_${item.title}`,
        value: item.title || '',
      })),
    };
    return contentItem;
  }

  if (type === 'OptIn') {
    contentItem.data = {
      label: component.label || 'Label',
      required: component.required || false,
    };
    return contentItem;
  }

  if (type === 'Image') {
    contentItem.data = {
      text: component.src || '',
    };
    return contentItem;
  }

  return contentItem;
};

export const convertFlowJSONToFormBuilder = (flowJSON: any): Screen[] => {
  if (!flowJSON || !flowJSON.screens || !Array.isArray(flowJSON.screens)) {
    return [];
  }

  return flowJSON.screens.map((flowScreen: any, screenIndex: number) => {
    const formLayout = flowScreen.layout?.children?.[0];
    const formChildren = formLayout?.children || [];

    let buttonLabel = 'Continue';
    const footerComponent = formChildren.find((child: any) => child.type === 'Footer');
    if (footerComponent) {
      buttonLabel = footerComponent.label || 'Continue';
    }

    const content: ContentItem[] = formChildren
      .map((component: any, index: number) => {
        const item = convertWhatsAppComponentToContentItem(component, index);
        if (item && component.name) {
          const componentName = component.name;
          const parts = componentName.split('_');

          if (!(parts.length >= 4 && parts[0] === 'screen')) {
            item.data.variableName = componentName;
          }
        }
        return item;
      })
      .filter((item: ContentItem | null) => item !== null) as ContentItem[];

    return {
      id: (screenIndex + 1).toString(),
      name: flowScreen.title || `Screen ${screenIndex + 1}`,
      order: screenIndex,
      content,
      buttonLabel,
    };
  });
};
