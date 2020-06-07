export interface Tag {
  id: number;
  label: string;
  description: string;
  is_active: boolean;
  is_reserved: boolean;
  language_id: number;
  parent_id: number;
  //created_date: Date;
}

export const FETCH_TAGS = 'FETCH_TAGS';
export const ADD_TAG = 'ADD_TAG';
export const EDIT_TAG = 'EDIT_TAG';
export const DELETE_TAG = 'DELETE_TAG';

export interface TagState {
  tags: Tag[];
}

interface FetchTagsAction {
  type: typeof FETCH_TAGS;
}

interface AddTagAction {
  type: typeof ADD_TAG;
  payload: Tag[];
}

interface EditTagAction {
  type: typeof EDIT_TAG;
  payload: Tag[];
}

interface DeleteTagAction {
  type: typeof DELETE_TAG;
  meta: {
    id: number
  }
}

export type TagActionTypes = FetchTagsAction | AddTagAction | EditTagAction | DeleteTagAction;