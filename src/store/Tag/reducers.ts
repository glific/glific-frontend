import { TagState, FETCH_TAGS, ADD_TAG, EDIT_TAG, DELETE_TAG, TagActionTypes } from "./types";

import { updateObject } from './../../common/utils';

const initialState: TagState = {
  tags: []
};

const editTag = (state: any, action: any) => {
  // get the copy of existing tags from state
  let currentTags = state.tags.slice(0);

  currentTags.filter((tag: any, index: number) => {
    if (tag.id === action.payload.id) {
      currentTags[index] = { ...tag, ...action.payload };
    }
    return state;
  });

  // return updated state
  return updateObject(state, { tags: currentTags });
}

const addTag = (state: TagState, action: any) => {
  // get the copy of existing tags from state
  const currentTags = state.tags.slice(0);

  // add new tag
  currentTags.push(action.payload);

  // return updated state
  return updateObject(state, { tags: currentTags });
};

const fetchTags = (state: TagState) => {
  return state;
}

const deleteTag = (state: TagState, action: any) => {
  // get the copy of existing tags from state
  let currentTags = state.tags.slice(0);

  // build new array skip the tag being deleted
  const newTags = currentTags.filter((tag: any) => (tag.id !== action.meta.tagId));

  // return updated state
  return updateObject(state, { tags: newTags });
}

export function TagReducer(
  state = initialState,
  action: TagActionTypes
): TagState {
  switch (action.type) {
    case FETCH_TAGS:
      return fetchTags(state);
    case ADD_TAG:
      return addTag(state, action);
    case EDIT_TAG:
      return editTag(state, action);
    case DELETE_TAG:
      return deleteTag(state, action);
    default:
      return state;
  }
}
