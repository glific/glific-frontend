import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { AppState } from '../../config/store';
import styles from './Tag.module.css';
import * as tagActions from '../../store/Tag/actions';
import * as tagTypes from '../../store/Tag/types';

export interface TagProps {
  match: any;
}

export const Tag: React.SFC<TagProps> = (props) => {
  const tagList = useSelector((state: AppState) => {
    return state.tag.tags;
  });

  const dispatch = useDispatch();
  const onTagAdd = (tag: tagTypes.Tag) => {
    dispatch(tagActions.addTag(tag));
  };

  const onTagEdit = (tag: tagTypes.Tag) => {
    dispatch(tagActions.editTag(tag));
  };

  const tagId = props.match ? props.match.params.id : null;
  const tag = tagId ? tagList.find((tag) => tag.id === Number(tagId)) : null;

  const [name, setName] = useState(tag ? tag.name : '');
  const [description, setDescription] = useState(tag ? tag.description : '');
  const [isActive, setIsActive] = useState(tag ? tag.is_active : false);
  const [isReserved, setIsReserved] = useState(tag ? tag.is_reserved : false);
  const [languageId, setLanguageId] = useState(tag ? tag.language_id : '');
  const [parentId, setParentId] = useState(tag ? tag.parent_id : '');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const saveHandler = () => {
    const payload: tagTypes.Tag = {
      id: Number(tag ? tagId : Math.floor(Math.random() * Math.floor(100))),
      name: name,
      description: description,
      is_active: isActive,
      is_reserved: isReserved,
      language_id: Number(languageId),
      parent_id: Number(parentId),
    };

    if (tag) {
      onTagEdit(payload);
    } else {
      onTagAdd(payload);
    }

    setFormSubmitted(true);
  };

  const cancelHandler = () => {
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return <Redirect to="/tag" />;
  }

  let form = (
    <>
      <div className={styles.Input}>
        <label className={styles.Label}>Name</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(event) => setName(event?.target.value)}
        />
      </div>
      <div className={styles.Input}>
        <label className={styles.Label}>Description</label>
        <input
          type="text"
          name="description"
          value={description}
          onChange={(event) => setDescription(event?.target.value)}
        />
      </div>
      <div className={styles.Input}>
        <label className={styles.Label}>Is Active?</label>
        <input
          type="checkbox"
          name="is_active"
          checked={isActive}
          onChange={(event) => setIsActive(event?.target.checked)}
        />
      </div>
      <div className={styles.Input}>
        <label className={styles.Label}>Is Reserved?</label>
        <input
          type="checkbox"
          name="is_reserved"
          checked={isReserved}
          onChange={(event) => setIsReserved(event?.target.checked)}
        />
      </div>
      <div className={styles.Input}>
        <label className={styles.Label}>Language</label>
        <input
          type="number"
          name="language_id"
          value={languageId}
          onChange={(event) => setLanguageId(event?.target.value)}
        />
      </div>
      <div className={styles.Input}>
        <label className={styles.Label}>Parent</label>
        <input
          type="number"
          name="parent_id"
          value={parentId}
          onChange={(event) => setParentId(event?.target.value)}
        />
      </div>
      <button color="primary" onClick={saveHandler}>
        Save
      </button>
      &nbsp;
      <button color="secondary" onClick={cancelHandler}>
        Cancel
      </button>
    </>
  );

  return (
    <div className={styles.TagAdd}>
      <h4>{tag ? 'Edit tag information' : 'Enter tag information'}</h4>
      {form}
    </div>
  );
};
