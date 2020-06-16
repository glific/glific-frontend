import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { Input } from '../../components/UI/Form/Input/Input';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { Button } from '@material-ui/core';
import { useApolloClient } from '@apollo/client';
import styles from './Tag.module.css';
import { useQuery, useMutation } from '@apollo/client';
import Paper from '@material-ui/core/Paper';
import { GET_LANGUAGES, GET_TAGS, GET_TAG } from '../../graphql/queries/Tag';
import { setNotification } from '../../common/notification';
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

  const client = useApolloClient();

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
    const payload = {
      label: tag.label,
      description: tag.description,
      isActive: tag.isActive,
      isReserved: tag.isReserved,
      languageId: Number(tag.languageId),
    };
    let message;

    if (tagId) {
      updateTag({
        variables: {
          id: tagId,
          input: payload,
        },
      });
      message = 'Tag edited successfully!';
    } else {
      createTag({
        variables: {
          input: payload,
        },
      });
      message = 'Tag added successfully!';
    }
    setNotification(client, message);
    setFormSubmitted(true);
  };

  const cancelHandler = () => {
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return <Redirect to="/tag" />;
  }

<<<<<<< HEAD
  const languageOptions = languages.data
    ? languages.data.languages.map((language: any) => {
        return (
          <MenuItem value={language.id} key={language.id}>
            {language.label}
          </MenuItem>
        );
      })
    : null;
=======
  const languageOptions = languages.data ? languages.data.languages : null;
  const formFields = [
    { component: Input, name: 'label', type: 'text', label: 'label', options: null },
    { component: Input, name: 'description', type: 'text', label: 'Description', options: null },
    { component: Checkbox, name: 'isActive', type: 'checkbox', label: 'Is Active', options: null },
    {
      component: Checkbox,
      name: 'isReserved',
      type: 'checkbox',
      label: 'Is Reserved',
      options: null,
    },
    {
      component: Dropdown,
      name: 'languageId',
      type: null,
      label: 'Language',
      options: languageOptions,
    },
  ];
>>>>>>> master

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
              {formFields.map((field) => {
                return (
                  <Field
                    component={field.component}
                    name={field.name}
                    type={field.type}
                    label={field.label}
                    options={field.options}
                  ></Field>
                );
              })}
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
