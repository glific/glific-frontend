export interface Screen {
  id: string;
  name: string;
  order: number;
  content: ContentItem[];
  buttonLabel: string;
}

export interface ContentItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'document';
  value: string;
  order: number;
}

export interface FormBuilderProps {
  formId?: string;
  onSave?: (screens: Screen[]) => void;
}
