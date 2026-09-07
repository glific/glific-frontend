export interface GoldenQaSet {
  id: string;
  name: string;
  totalItems?: number | null;
  insertedAt: string;
}

export interface GoldenQaRow {
  question: string;
  answer: string;
  category: string;
}
