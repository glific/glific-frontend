import { Screen, ContentItem } from './FormBuilder.types';

/** Converts a screen name to a snake_case ID by lowercasing, stripping non-alpha chars, and replacing spaces with underscores. */
const toSnakeCaseId = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

/** Generates a random 6-character lowercase alphabetic string for use as an ID suffix. */
const randomAlphaId = (): string =>
  Array.from({ length: 6 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

/** Generates a unique snake_case ID for each screen, appending a random suffix on collision or empty name. */
const generateUniqueScreenIds = (screens: Screen[]): string[] => {
  const ids: string[] = [];
  const usedIds = new Set<string>();

  screens.forEach((screen) => {
    let id = toSnakeCaseId(screen.name);

    if (!id || usedIds.has(id)) {
      const suffix = randomAlphaId();
      id = id ? `${id}_${suffix}` : `screen_${suffix}`;
    }

    usedIds.add(id);
    ids.push(id);
  });

  return ids;
};

/** Checks whether a content item has validation errors based on its type (empty labels, missing options, etc.). */
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

/** Returns true if a screen is missing its name or button label. */
export const hasScreenError = (screen: Screen): boolean => {
  const hasNameError = !screen.name || screen.name.trim() === '';
  const hasButtonLabelError = !screen.buttonLabel || screen.buttonLabel.trim() === '';
  return hasNameError || hasButtonLabelError;
};

/** Returns true if any two screens share the same name (case-insensitive). */
export const hasDuplicateScreenNames = (screens: Screen[]): boolean => {
  const names = screens.map((s) => s.name.trim().toLowerCase()).filter(Boolean);
  return new Set(names).size !== names.length;
};

/** Checks if a specific screen's name duplicates another screen's name. */
export const isDuplicateScreenName = (screens: Screen[], screenId: string): boolean => {
  const screen = screens.find((s) => s.id === screenId);
  if (!screen || !screen.name.trim()) return false;
  const name = screen.name.trim().toLowerCase();
  return screens.some((s) => s.id !== screenId && s.name.trim().toLowerCase() === name);
};

/** Sanitizes a name for use as a field identifier by replacing spaces with underscores and stripping invalid characters. */
const sanitizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

/** Returns true if the form has any errors — duplicate screen names, missing fields, or invalid content items. */
export const hasFormErrors = (screens: Screen[]): boolean => {
  if (hasDuplicateScreenNames(screens)) return true;
  return screens.some((screen) => {
    if (hasScreenError(screen)) return true;
    return screen.content.some((item) => hasContentItemError(item));
  });
};

/** Converts all form builder screens into a complete WhatsApp Flow JSON structure with version and screens array. */
export const convertFormBuilderToFlowJSON = (screens: Screen[]): any => {
  const totalScreens = screens.length;
  const screenIds = generateUniqueScreenIds(screens);
  const fieldNameMap = computeFieldNames(screens);

  const previousScreensPayloadData: Array<{ payloadKey: string; fieldType: string; inputType?: string }> = [];

  const flowScreens = screens.map((screen, index) => {
    const nextScreenId = index < totalScreens - 1 ? screenIds[index + 1] : undefined;

    const flowScreen = convertScreenToFlowJSON(
      screen,
      index,
      totalScreens,
      nextScreenId,
      screenIds[index],
      fieldNameMap,
      previousScreensPayloadData
    );

    screen.content.forEach((item) => {
      if (item.type === 'Text Answer' || item.type === 'Selection') {
        const fieldName = fieldNameMap.get(item.id) || 'field';
        const componentType = getWhatsAppComponentType(item.type, item.name);
        previousScreensPayloadData.push({
          payloadKey: fieldName,
          fieldType: componentType,
          inputType: item.data.inputType?.toLowerCase(),
        });
      }
    });

    return flowScreen;
  });

  return {
    version: '7.3',
    screens: flowScreens,
  };
};

/** Maps an internal content type and name to the corresponding WhatsApp Flow component type. */
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

/** Computes unique field names for all input components across screens, deduplicating with numeric suffixes. */
export const computeFieldNames = (screens: Screen[]): Map<string, string> => {
  const fieldNameMap = new Map<string, string>();
  const usedNames = new Set<string>();

  screens.forEach((screen) => {
    screen.content.forEach((item) => {
      if (item.type === 'Text Answer' || item.type === 'Selection') {
        let name = sanitizeName(item.data.variableName || '') || sanitizeName(item.data.label || '') || `field`;

        const baseName = name;
        let suffix = 1;
        while (usedNames.has(name)) {
          name = `${baseName}_${suffix}`;
          suffix += 1;
        }

        usedNames.add(name);
        fieldNameMap.set(item.id, name);
      }
    });
  });

  return fieldNameMap;
};


/** Converts a form builder content item into a WhatsApp Flow JSON component object. */
const convertContentItemToComponent = (item: ContentItem, fieldNameMap: Map<string, string>): any => {
  const componentType = getWhatsAppComponentType(item.type, item.name);
  const { data } = item;
  const fieldName = fieldNameMap.get(item.id);

  if (['TextHeading', 'TextSubheading', 'TextCaption', 'TextBody'].includes(componentType)) {
    return {
      text: data.text,
      type: componentType,
    };
  }

  if (componentType === 'TextInput') {
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
    return {
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'TextArea',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'DatePicker') {
    return {
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'DatePicker',
      ...(data.placeholder && { 'helper-text': data.placeholder }),
    };
  }

  if (componentType === 'RadioButtonsGroup') {
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: opt.id || `${index}_${opt.value}`,
        title: opt.value,
      })),
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'RadioButtonsGroup',
    };
  }

  if (componentType === 'CheckboxGroup') {
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: opt.id || `${index}_${opt.value}`,
        title: opt.value,
      })),
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'CheckboxGroup',
    };
  }

  if (componentType === 'Dropdown') {
    return {
      'data-source': (data.options || []).map((opt, index) => ({
        id: opt.id || `${index}_${opt.value}`,
        title: opt.value,
      })),
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'Dropdown',
    };
  }

  if (componentType === 'OptIn') {
    return {
      label: data.label,
      name: fieldName,
      required: data.required || false,
      type: 'OptIn',
    };
  }

  if (componentType === 'Image') {
    const src = data.text?.includes('base64,') ? data.text.split('base64,')[1] : data.text;
    return {
      type: 'Image',
      src: src || '',
      height: 400,
      'scale-type': 'contain',
    };
  }

  return null;
};

const INPUT_TYPE_TO_DATA_SCHEMA: Record<string, { type: string; __example__: any }> = {
  text: { type: 'string', __example__: 'Example' },
  number: { type: 'number', __example__: 0 },
  email: { type: 'string', __example__: 'example@mail.com' },
  password: { type: 'string', __example__: 'Example' },
  passcode: { type: 'string', __example__: '1234' },
  phone: { type: 'string', __example__: '+1234567890' },
};

/** Builds the data schema object for a screen based on input components from all previous screens. */
const generateScreenData = (
  previousScreensPayloadData: Array<{ payloadKey: string; fieldType: string; inputType?: string }>
): Record<string, any> => {
  const data: Record<string, any> = {};
  previousScreensPayloadData.forEach(({ payloadKey, fieldType, inputType }) => {
    if (fieldType === 'CheckboxGroup') {
      data[payloadKey] = {
        __example__: [],
        items: { type: 'string' },
        type: 'array',
      };
    } else if (fieldType === 'OptIn') {
      data[payloadKey] = {
        __example__: false,
        type: 'boolean',
      };
    } else if (fieldType === 'TextInput' && inputType) {
      const schema = INPUT_TYPE_TO_DATA_SCHEMA[inputType] || INPUT_TYPE_TO_DATA_SCHEMA.text;
      data[payloadKey] = { ...schema };
    } else {
      data[payloadKey] = {
        __example__: 'Example',
        type: 'string',
      };
    }
  });
  return data;
};

/** Generates the payload object for a screen's footer action, forwarding previous screen data and current form values. */
const generateScreenPayload = (
  screenContent: ContentItem[],
  fieldNameMap: Map<string, string>,
  previousScreensPayloadData: Array<{ payloadKey: string }>
): Record<string, string> => {
  const payload: Record<string, string> = {};

  previousScreensPayloadData.forEach(({ payloadKey }) => {
    payload[payloadKey] = `\${data.${payloadKey}}`;
  });

  screenContent.forEach((item) => {
    if (item.type === 'Text Answer' || item.type === 'Selection') {
      const fieldName = fieldNameMap.get(item.id);
      if (fieldName) {
        payload[fieldName] = `\${form.${fieldName}}`;
      }
    }
  });

  return payload;
};

/** Converts a single form builder screen into a WhatsApp Flow JSON screen object with layout, components, and footer. */
export const convertScreenToFlowJSON = (
  screen: Screen,
  screenIndex: number,
  totalScreens: number,
  nextScreenId?: string,
  screenId?: string,
  fieldNameMap: Map<string, string> = new Map(),
  previousScreensPayloadData: Array<{ payloadKey: string; fieldType: string; inputType?: string }> = []
): any => {
  const children: any[] = [];

  screen.content.forEach((item) => {
    const component = convertContentItemToComponent(item, fieldNameMap);
    if (component) {
      children.push(component);
    }
  });

  const isTerminal = screenIndex === totalScreens - 1;

  const payload = generateScreenPayload(screen.content, fieldNameMap, previousScreensPayloadData);

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

  const screenData = generateScreenData(previousScreensPayloadData);

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

/** Maps a WhatsApp Flow component type back to the internal content type and name used by the form builder. */
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

/** Converts a WhatsApp Flow JSON component back into a form builder content item. */
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
    const rawInputType = component['input-type'] || 'text';
    contentItem.data = {
      label: component.label || '',
      inputType: rawInputType.charAt(0).toUpperCase() + rawInputType.slice(1),
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
    const src = component.src || '';
    contentItem.data = {
      text: src && !src.startsWith('data:') ? `data:image/png;base64,${src}` : src,
    };
    return contentItem;
  }

  return contentItem;
};

/** Parses a complete WhatsApp Flow JSON structure back into an array of form builder screens. */
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
          item.data.variableName = component.name;
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

interface FlowJsonError {
  message: string;
  path?: string;
}

interface FlowJsonValidationResult {
  errors: FlowJsonError[];
}

const INPUT_COMPONENT_TYPES = [
  'TextInput',
  'TextArea',
  'DatePicker',
  'RadioButtonsGroup',
  'CheckboxGroup',
  'Dropdown',
  'OptIn',
];

/** Validates a WhatsApp Flow JSON structure, checking screen IDs, titles, layout, actions, components, and data properties. */
export const validateFlowJson = (parsedJson: any): FlowJsonValidationResult => {
  const errors: FlowJsonError[] = [];

  // Phase 1: Top-level structure
  if (!parsedJson.version || typeof parsedJson.version !== 'string') {
    errors.push({ message: "Missing or invalid 'version' field" });
  }

  if (!parsedJson.screens || !Array.isArray(parsedJson.screens)) {
    errors.push({ message: 'Missing or invalid "screens" array' });
    return { errors };
  }

  if (parsedJson.screens.length === 0) {
    errors.push({ message: 'Screens array cannot be empty' });
    return { errors };
  }

  const { screens } = parsedJson;
  const allScreenIds = new Set<string>(screens.map((s: any) => s.id).filter(Boolean));
  const componentNameMap = new Map<string, string>();

  // Phase 2: Reserved ID checks
  screens.forEach((screen: any, i: number) => {
    const { id } = screen;
    const screenLabel = screen.title || `Screen ${i + 1}`;

    if (id && id === 'SUCCESS') {
      errors.push({
        message: `Screen '${screenLabel}': ID 'SUCCESS' is reserved by Meta and cannot be used`,
        path: `screens[${i}].id`,
      });
    }
  });

  // Phase 3-6: Per-screen validation
  screens.forEach((screen: any, i: number) => {
    const screenLabel = screen.title || `Screen ${i + 1}`;
    const isLast = i === screens.length - 1;

    // Phase 3: Structure
    if (!screen.id || typeof screen.id !== 'string') {
      errors.push({ message: `Screen ${i + 1}: Missing screen ID`, path: `screens[${i}].id` });
    } else if (!/^[a-zA-Z_]+$/.test(screen.id)) {
      errors.push({
        message: `Screen '${screenLabel}' (id: '${screen.id}'): Screen ID should only contain alphabets and underscores`,
        path: `screens[${i}].id`,
      });
    }

    if (!screen.title || typeof screen.title !== 'string') {
      errors.push({
        message: `Screen ${i + 1}: Missing screen title`,
        path: `screens[${i}].title`,
      });
    }

    if (screen.layout?.type !== 'SingleColumnLayout') {
      errors.push({
        message: `Screen '${screenLabel}': Layout type must be 'SingleColumnLayout'`,
        path: `screens[${i}].layout.type`,
      });
    }

    const layoutChildren = screen.layout?.children;
    if (!Array.isArray(layoutChildren) || layoutChildren.length === 0) {
      errors.push({
        message: `Screen '${screenLabel}': Missing layout children`,
        path: `screens[${i}].layout.children`,
      });
      return;
    }

    const formComponent = layoutChildren[0];
    if (formComponent?.type !== 'Form') {
      errors.push({
        message: `Screen '${screenLabel}': First layout child must be a Form component`,
        path: `screens[${i}].layout.children[0]`,
      });
      return;
    }

    const formChildren = formComponent.children;
    if (!Array.isArray(formChildren)) {
      errors.push({
        message: `Screen '${screenLabel}': Form component must have children`,
        path: `screens[${i}].layout.children[0].children`,
      });
      return;
    }

    // Footer validation
    const footers = formChildren.filter((c: any) => c.type === 'Footer');
    const nonFooterComponents = formChildren.filter((c: any) => c.type !== 'Footer');

    if (footers.length === 0) {
      errors.push({
        message: `Screen '${screenLabel}': Must have exactly one Footer component`,
        path: `screens[${i}]`,
      });
    } else if (footers.length > 1) {
      errors.push({
        message: `Screen '${screenLabel}': Must have exactly one Footer component, found ${footers.length}`,
        path: `screens[${i}]`,
      });
    } else {
      const footer = footers[0];

      if (!footer.label || typeof footer.label !== 'string' || footer.label.trim() === '') {
        errors.push({
          message: `Screen '${screenLabel}': Footer label is required`,
          path: `screens[${i}].Footer.label`,
        });
      } else if (footer.label.length > 35) {
        errors.push({
          message: `Screen '${screenLabel}': Footer label must be 35 characters or fewer (currently ${footer.label.length})`,
          path: `screens[${i}].Footer.label`,
        });
      }

      // Phase 4: Action validation
      const action = footer['on-click-action'];
      if (!action) {
        errors.push({
          message: `Screen '${screenLabel}': Footer must have an 'on-click-action'`,
          path: `screens[${i}].Footer.on-click-action`,
        });
      } else {
        const actionName = action.name;

        if (actionName !== 'navigate' && actionName !== 'complete') {
          errors.push({
            message: `Screen '${screenLabel}': Action must be 'navigate' or 'complete', found '${actionName}'`,
            path: `screens[${i}].Footer.on-click-action.name`,
          });
        }

        if (isLast) {
          if (actionName !== 'complete') {
            errors.push({
              message: `Last screen '${screenLabel}' must use 'complete' action (it is the terminal screen)`,
              path: `screens[${i}].Footer.on-click-action.name`,
            });
          }
          if (screen.terminal !== true) {
            errors.push({
              message: `Last screen '${screenLabel}' must have 'terminal: true'`,
              path: `screens[${i}].terminal`,
            });
          }
        } else {
          if (actionName !== 'navigate') {
            errors.push({
              message: `Screen '${screenLabel}': Non-terminal screens must use 'navigate' action`,
              path: `screens[${i}].Footer.on-click-action.name`,
            });
          }

          if (actionName === 'navigate') {
            const { next } = action;
            if (!next || !next.name) {
              errors.push({
                message: `Screen '${screenLabel}': Navigate action must specify a 'next' screen`,
                path: `screens[${i}].Footer.on-click-action.next`,
              });
            } else {
              if (next.type !== 'screen') {
                errors.push({
                  message: `Screen '${screenLabel}': Navigate next.type must be 'screen'`,
                  path: `screens[${i}].Footer.on-click-action.next.type`,
                });
              }
              if (!allScreenIds.has(next.name)) {
                errors.push({
                  message: `Screen '${screenLabel}': Navigate action references non-existent screen '${next.name}'`,
                  path: `screens[${i}].Footer.on-click-action.next.name`,
                });
              }
            }
          }
        }
      }
    }

    // Component count limit
    if (nonFooterComponents.length > 50) {
      errors.push({
        message: `Screen '${screenLabel}': Maximum 50 components allowed per screen (found ${nonFooterComponents.length})`,
        path: `screens[${i}]`,
      });
    }

    // Phase 5: Component name uniqueness
    formChildren.forEach((component: any) => {
      if (INPUT_COMPONENT_TYPES.includes(component.type) && component.name) {
        const existingScreen = componentNameMap.get(component.name);
        if (existingScreen) {
          errors.push({
            message: `Duplicate component name '${component.name}' in screen '${screenLabel}' (first used in '${existingScreen}')`,
            path: `screens[${i}]`,
          });
        } else {
          componentNameMap.set(component.name, screenLabel);
        }
      }
    });

    // Phase 6: Data property validation
    if (screen.data && typeof screen.data === 'object') {
      Object.entries(screen.data).forEach(([propName, propValue]: [string, any]) => {
        if (!propValue || typeof propValue !== 'object') return;

        if (!('__example__' in propValue)) {
          errors.push({
            message: `Screen '${screenLabel}': Data property '${propName}' is missing '__example__'`,
            path: `screens[${i}].data.${propName}`,
          });
        }

        if (!propValue.type) {
          errors.push({
            message: `Screen '${screenLabel}': Data property '${propName}' is missing 'type'`,
            path: `screens[${i}].data.${propName}`,
          });
        }
      });
    }
  });

  return { errors };
};
