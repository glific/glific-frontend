export type StatusType = 'APPROVED' | 'PENDING' | 'REJECTED' | 'FAILED';

export interface LanguageVariant {
  id: string;
  bspId: string | null;
  body: string;
  category: string;
  language: { id: string; label: string };
  status: StatusType;
  quality: string | null;
  reason: string | null;
  updatedAt: string;
  isActive: boolean;
}

export interface GroupedTemplate {
  shortcode: string;
  label: string;
  category: string;
  tag: { id: string; label: string } | null;
  languageVariants: LanguageVariant[];
}
