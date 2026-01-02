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
      text: data.text,
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
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'TextInput',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'TextArea') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'TextArea',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'DatePicker') {
    const fieldName = generateUniqueName(data.label || 'Label');
    return {
      label: data.label,
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
      label: data.label,
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
      label: data.label,
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
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'Dropdown',
    };
  }

  if (componentType === 'OptIn') {
    const fieldName = generateUniqueName(data.label || 'Label');
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
      src: data.text || '',
      height: 400,
      'scale-type': 'contain',
    };
  }

  return null;
};

const generatePayloadKey = (screenIndex: number, label: string, fieldCounter: number): string => {
  const labelKey = (label || 'field')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/gi, '')
    .substring(0, 20);
  return `screen_${screenIndex}_${labelKey}_${fieldCounter}`;
};

const generateScreenData = (previousScreensPayloadKeys: string[]): Record<string, any> => {
  const data: Record<string, any> = {};
  previousScreensPayloadKeys.forEach((key) => {
    data[key] = {
      __example__: 'Example',
      type: 'string',
    };
  });
  return data;
};

const generateScreenPayload = (
  screenIndex: number,
  componentsMap: Map<string, any>,
  screenContent: ContentItem[],
  previousScreensPayloadKeys: string[]
): Record<string, string> => {
  const payload: Record<string, string> = {};

  if (previousScreensPayloadKeys.length > 0) {
    previousScreensPayloadKeys.forEach((key) => {
      payload[key] = `\${data.${key}}`;
    });
  }

  let fieldCounter = 0;
  screenContent.forEach((item) => {
    if (item.type === 'Text Answer' || item.type === 'Selection') {
      const component = componentsMap.get(item.id);
      if (component && component.name) {
        const payloadKey = generatePayloadKey(screenIndex, item.data.label || 'field', fieldCounter);
        payload[payloadKey] = `\${form.${component.name}}`;
        fieldCounter++;
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
  previousScreensPayloadKeys: string[] = []
): any => {
  const children: any[] = [];
  const componentsMap: Map<string, any> = new Map();

  screen.content.forEach((item) => {
    const component = convertContentItemToComponent(item);
    if (component) {
      children.push(component);
      componentsMap.set(item.id, component);
    }
  });

  const isTerminal = screenIndex === totalScreens - 1;

  const payload = generateScreenPayload(screenIndex, componentsMap, screen.content, previousScreensPayloadKeys);

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

  const screenId = screen.name
    .toLowerCase()
    .replace(/\d+/g, (match) => {
      const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      return parseInt(match) < 10 ? numbers[parseInt(match)] : match;
    })
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();

  const screenData = generateScreenData(previousScreensPayloadKeys);

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
  let previousScreensPayloadKeys: string[] = [];

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

    const flowScreen = convertScreenToFlowJSON(screen, index, totalScreens, nextScreenId, previousScreensPayloadKeys);

    let fieldCounter = 0;
    screen.content.forEach((item) => {
      if (item.type === 'Text Answer' || item.type === 'Selection') {
        const payloadKey = generatePayloadKey(index, item.data.label || 'field', fieldCounter);
        previousScreensPayloadKeys.push(payloadKey);
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

export const generateFieldName = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
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
      label: component.label || 'Label',
      inputType: component['input-type'] || 'text',
      required: component.required || false,
      placeholder: component['helper-text'] || '',
    };
    return contentItem;
  }

  if (type === 'TextArea') {
    contentItem.data = {
      label: component.label || 'Label',
      required: component.required || false,
      placeholder: component['helper-text'] || '',
    };
    return contentItem;
  }

  if (type === 'DatePicker') {
    contentItem.data = {
      label: component.label || 'Label',
      required: component.required || false,
      placeholder: component['helper-text'] || '',
    };
    return contentItem;
  }

  if (['RadioButtonsGroup', 'CheckboxGroup', 'Dropdown'].includes(type)) {
    const dataSource = component['data-source'] || [];
    contentItem.data = {
      label: component.label || 'Label',
      required: component.required || false,
      options: dataSource.map((item: any, index: number) => ({
        id: item.id || `${index}_${item.title}`,
        value: item.title || 'Option',
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
      .map((component: any, index: number) => convertWhatsAppComponentToContentItem(component, index))
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
