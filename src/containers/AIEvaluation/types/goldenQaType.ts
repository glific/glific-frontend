export interface GoldenQaSet {
  id: string;
  name: string;
  insertedAt: string;
}

export interface GoldenQaRow {
  question: string;
  answer: string;
  category: string;
}
