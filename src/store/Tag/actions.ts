import { Tag, FETCH_TAGS, ADD_TAG, EDIT_TAG, DELETE_TAG } from "./types";

export const fetchTags = (tags: Tag) => {
  return {
    type: FETCH_TAGS,
    payload: tags,
  };
};

export const addTag = (tag: Tag) => {
  return {
    type: ADD_TAG,
    payload: tag,
  };
};

export const editTag = (tag: Tag) => {
  return {
    type: EDIT_TAG,
    payload: tag,
  };
};

export const deleteTag = (tagId: number) => {
  return {
    type: DELETE_TAG,
    meta: { tagId },
  };
};


