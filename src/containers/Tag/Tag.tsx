import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { Button, MenuItem } from '@material-ui/core';
import { TextField, Select } from 'formik-material-ui';
import { CheckboxWithLabel } from 'formik-material-ui';
import styles from './Tag.module.css';

import { Input } from '../../components/UI/Form/Input/Input';
import { CheckboxElement } from '../../components/UI/Form/Checkbox/Checkbox';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { useQuery, gql, useMutation } from '@apollo/client';
import Paper from '@material-ui/core/Paper';
import { GET_LANGUAGES, GET_TAGS, GET_TAG } from '../../graphql/queries/Tag';
import { UPDATE_TAG, CREATE_TAG } from '../../graphql/mutations/Tag';

export interface TagProps {
  match: any;
}

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
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const saveHandler = (tag: any) => {
    console.log(tag);
    const payload = {
      label: tag.label,
      description: tag.description,
      isActive: tag.isActive,
      isReserved: tag.isReserved,
      languageId: Number(tag.languageId),
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

  const languageOptions = languages.data ? languages.data.languages : null;

  let form = (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          label: label,
          description: description,
          isActive: isActive,
          isReserved: isReserved,
          languageId: languageId,
        }}
        validate={(values) => {
          const errors: Partial<any> = {};
          if (!values.label) {
            errors.label = 'Required';
          } else if (values.label.length > 10) {
            errors.label = 'Too Long';
          }
          if (!values.description) {
            errors.description = 'Required';
          }
          return errors;
        }}
        onSubmit={(tag) => {
          saveHandler(tag);
        }}
      >
        {({ submitForm }) => (
          <Paper elevation={3}>
            <Form className={styles.Form}>
              <Field component={Input} name="label" type="text" label="Label" />
              <Field component={Input} type="text" name="description" label="Description" />

              <Field
                component={CheckboxElement}
                type="checkbox"
                name="isActive"
                label="Is Active"
              />

              <Field
                component={CheckboxElement}
                name="isReserved"
                type="checkbox"
                label="Is Reserved"
              />

              <Field
                component={Dropdown}
                name="languageId"
                options={languageOptions}
                label="Language"
              />

              <div className={styles.Buttons}>
                <Button variant="contained" color="primary" onClick={submitForm}>
                  Save
                </Button>
                &nbsp;&nbsp;
                <Button variant="contained" color="default" onClick={cancelHandler}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Paper>
        )}
      </Formik>
    </>
  );

  return (
    <div className={styles.TagAdd}>
      <h3>{tagId ? 'Edit tag information' : 'Enter tag information'}</h3>
      {form}
    </div>
  );
};
