import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import { AppState } from '../../../store/StoreConfig';
import { Tag } from '../../../store/Tag/types';
import * as tagActions from '../../../store/Tag/actions';

export interface TagListProps {}

export const TagList: React.SFC<TagListProps> = (props) => {
  const [newTag, setNewTag] = useState(false);

  const tagList = useSelector((state: AppState) => {
    return state.tag.tags;
  });

  const dispatch = useDispatch();
  const onFetchTags = useCallback(() => {
    dispatch(tagActions.fetchTags());
  }, [dispatch]);

  const onTagDelete = (tagId: number) => {
    dispatch(tagActions.deleteTag(tagId));
  };

  useEffect(() => {
    onFetchTags();
  }, [onFetchTags]);

  if (newTag) {
    return <Redirect to="/tag/add" />;
  }

  let listing: any;
  if (tagList.length > 0) {
    listing = tagList.map((n: Tag) => {
      return (
        <div key={n.id}>
          {n.name} <Link to={'/tag/' + n.id + '/edit'}>Edit</Link>{' '}
          <button onClick={() => onTagDelete(n.id)}>Delete</button>
        </div>
      );
    });
  } else {
    listing = <p>There are no tags.</p>;
  }

  return (
    <div>
      <h2>List of tags</h2>
      <div>
        <button onClick={() => setNewTag(true)}>New Tag</button>
      </div>
      <br />
      <div>
        <strong>Name</strong>
      </div>
      <br />
      {listing}
    </div>
  );
};
