import { TagState, FETCH_TAGS, ADD_TAG, EDIT_TAG, DELETE_TAG, TagActionTypes } from "./types";

const initialState: TagState = {
  tags: []
};

export function TagReducer(
  state = initialState,
  action: TagActionTypes
): TagState {
  switch (action.type) {
    case FETCH_TAGS:
      return {
        tags: [...state.tags]
      };
    case ADD_TAG:
      return { ...state, ...action.payload };
    case EDIT_TAG:
      return { ...state, ...action.payload };
    case DELETE_TAG:
      return {
        tags: state.tags.filter(
          tag => tag.id !== action.meta.id
        )
      };
    default:
      return state;
  }
}



// import * as actionTypes from '../../models/Tag';
// import { updateObject } from '../../common/utils';

// interface tagAction {
//   type: string;
//   payload?: any;
// }

// const initialState = {
//   tags: [],
// };

// const addTag = (state: actionTypes.Tag[], action: tagAction) => {
//   // build the new tag
//   const newTag = { ...action.payload, id: Math.random() };

//   // // get the copy of existing tags from state
//   // const currentTags = state.tags.slice(0);

//   // // add new tag
//   // currentTags.push(newTag);

//   // return updateObject(state, { tags: currentTags });
// };

// const fetchTags = (state: actionTypes.Tag[], action: tagAction) => {
//   return state;
// };

// const reducer = (state: actionTypes.Tag[] = initialState, action: tagAction) => {
//   switch (action.type) {
//     case actionTypes.TagActions.FETCH_TAGS:
//       return fetchTags(state, action);
//     case actionTypes.TagActions.ADD_TAG:
//       return addTag(state, action);
//     case actionTypes.TagActions.EDIT_TAG:
//       return addTag(state, action);
//     case actionTypes.TagActions.DELETE_TAG:
//       return addTag(state, action);
//     default:
//       return state;
//   }
// };

// export default reducer;
