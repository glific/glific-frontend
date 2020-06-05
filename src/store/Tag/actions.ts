import { Tag, FETCH_TAGS, ADD_TAG, EDIT_TAG, DELETE_TAG } from "./types";

export const fetchTags = () => {
  return {
    type: FETCH_TAGS,
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


