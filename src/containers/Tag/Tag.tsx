import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { Button } from '../../components/UI/Form/Button/Button';
import { Input } from '../../components/UI/Form/Input/Input';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { useApolloClient } from '@apollo/client';
import styles from './Tag.module.css';
import { useQuery, useMutation } from '@apollo/client';
import Paper from '@material-ui/core/Paper';
import { GET_LANGUAGES, GET_TAG, FILTER_TAGS } from '../../graphql/queries/Tag';
import { setNotification } from '../../common/notification';
import { UPDATE_TAG, CREATE_TAG } from '../../graphql/mutations/Tag';

export interface TagProps {
  match: any;
}

export const Tag: React.SFC<TagProps> = (props) => {
  const queryVariables = {
    filter: {
      label: '',
    },
    opts: {
      limit: 10,
      offset: 0,
      order: 'ASC',
    },
  };
  const languages = useQuery(GET_LANGUAGES, {
    onCompleted: (data) => {
      setLanguageId(data.languages[0].id);
    },
  });
  const tagId = props.match.params.id ? props.match.params.id : false;
  const { loading, error } = useQuery(GET_TAG, {
    variables: { id: tagId },
    skip: !tagId,
    onCompleted: (data) => {
      if (tagId && data) {
        tag = data.tag.tag;
        setLabel(tag.label);
        setDescription(tag.description);
        setIsActive(tag.isActive);
        setIsReserved(tag.isReserved);
        setLanguageId(tag.language.id);
      }
    },
  });
  const [updateTag] = useMutation(UPDATE_TAG, {
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [createTag] = useMutation(CREATE_TAG, {
    update(cache, { data: { createTag } }) {
      const tags: any = cache.readQuery({
        query: FILTER_TAGS,
        variables: queryVariables,
      });

      cache.writeQuery({
        query: FILTER_TAGS,
        variables: queryVariables,
        data: { tags: tags.tags.concat(createTag.tag) },
      });
    },
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const client = useApolloClient();

  let tag: any = null;

  if (loading) return <Loading />;
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
  };

  const cancelHandler = () => {
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return <Redirect to="/tag" />;
  }

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
              {formFields.map((field, index) => {
                return (
                  <Field
                    key={index}
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
