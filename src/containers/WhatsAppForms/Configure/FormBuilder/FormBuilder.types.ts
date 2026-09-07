export interface Screen {
  id: string;
  name: string;
  order: number;
  content: ContentItem[];
  buttonLabel: string;
  footerAttributes?: Record<string, any>;
}

export interface ContentItem {
  id: string;
  name: string;
  type: string;
  order: number;
  data: ContentItemData;
}

export interface ContentItemData {
  id?: string;
  label?: string;
  text?: string;
  required?: boolean;
  options?: ContentOption[];
  inputType?: string;
  placeholder?: string;
  variableName?: string;
  extraAttributes?: Record<string, any>;
  rawComponent?: any;
  layoutDirect?: boolean;
}

export interface ContentOption {
  id: string;
  value: string;
  extraAttributes?: Record<string, any>;
}

export interface FormBuilderProps {
  onSave?: (screens: Screen[]) => void;
  onScreensChange?: (screens: Screen[]) => void;
  screens?: Screen[];
  expandedScreenId: string | null;
  setExpandedScreenId: (id: string | null) => void;
  expandedContentId: string | null;
  setExpandedContentId: (id: string | null) => void;
  isViewOnly?: boolean;
}
