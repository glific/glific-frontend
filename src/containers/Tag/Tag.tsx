import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { AppState } from '../../config/store';
import styles from './Tag.module.css';
import * as tagActions from '../../store/Tag/actions';
import * as tagTypes from '../../store/Tag/types';
import { useQuery, gql, useMutation } from '@apollo/client';

export interface TagProps {
  match: any;
}

const GET_LANGUAGES = gql`
  {
    languages {
      id
      label
    }
  }
`;

const GET_TAGS = gql`
  {
    tags {
      id
      description
      label
    }
  }
`;

const GET_TAG = gql`
  query getTag($id: ID!) {
    tag(id: $id) {
      tag {
        id
        label
        description
        isActive
        isReserved
        language {
          id
        }
      }
    }
  }
`;

const CREATE_TAG = gql`
  mutation creTag($input: TagInput!) {
    createTag(input: $input) {
      tag {
        id
        description
        label
        isActive
        isReserved
        language {
          id
        }
      }
    }
  }
`;

const UPDATE_TAG = gql`
  mutation updateTag($id: ID!, $input: TagInput!) {
    updateTag(id: $id, input: $input) {
      tag {
        id
        label
        isActive
        isReserved
        description
        language {
          id
        }
      }
      errors {
        key
        message
      }
    }
  }
`;

export const Tag: React.SFC<TagProps> = (props) => {
  const tagId = props.match.params.id ? props.match.params.id : false;
  const { loading, error, data } = useQuery(GET_TAG, {
    variables: { id: tagId },
    skip: !tagId,
  });
  const [updateTag] = useMutation(UPDATE_TAG);
  const languages = useQuery(GET_LANGUAGES);

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [languageId, setLanguageId] = useState(1);
  const [parentId, setParentId] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [createTag] = useMutation(CREATE_TAG, {
    update(cache, { data: { createTag } }) {
      const tags: any = cache.readQuery({ query: GET_TAGS });

      cache.writeQuery({
        query: GET_TAGS,
        data: { tags: tags.tags.concat(createTag.tag) },
      });
    },
  });

  let tag: any = null;

  useEffect(() => {
    if (tagId && data) {
      tag = tagId ? data.tag.tag : null;
      setLabel(tag.label);
      setDescription(tag.description);
      setIsActive(tag.isActive);
      setIsReserved(tag.isReserved);
      setLanguageId(tag.language.id);
      setParentId(tag.parent_id);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const saveHandler = () => {
    const payload: tagTypes.Tag = {
      label: label,
      description: description,
      isActive: isActive,
      isReserved: isReserved,
      languageId: Number(languageId),
    };

    if (tagId) {
      updateTag({
        variables: {
          id: tagId,
          input: payload,
        },
      });
    } else {
      createTag({
        variables: {
          input: payload,
        },
      });
    }
    setFormSubmitted(true);
  };

  const cancelHandler = () => {
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return <Redirect to="/tag" />;
  }

  const languageOptions = languages.data
    ? languages.data.languages.map((language: any) => {
      return (
        <option value={language.id} key={language.id}>
          {language.label}
        </option>
      );
    })
    : null;

  let form = (
    <>
      <div className={styles.Input}>
        <label className={styles.Label}>Name</label>
        <input
          type="text"
          name="name"
          value={label}
          onChange={(event) => setLabel(event?.target.value)}
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
        <select
          name="language_id"
          value={languageId}
          onChange={(event) => setLanguageId(Number(event?.target.value))}
        >
          {languageOptions}
        </select>
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
