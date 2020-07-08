import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { Button } from '../../components/UI/Form/Button/Button';
import { Input } from '../../components/UI/Form/Input/Input';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { useApolloClient } from '@apollo/client';
import styles from './Tag.module.css';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LANGUAGES, GET_TAG, FILTER_TAGS } from '../../graphql/queries/Tag';
import { setNotification } from '../../common/notification';
import { UPDATE_TAG, CREATE_TAG } from '../../graphql/mutations/Tag';
import { Typography, IconButton } from '@material-ui/core';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/White.svg';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { DELETE_TAG } from '../../graphql/mutations/Tag';

export interface TagProps {
  match: any;
}

export const Tag: React.SFC<TagProps> = (props) => {
  const [showDialog, setShowDialog] = useState(false);
  const [deleteTag] = useMutation(DELETE_TAG);
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
        setKeywords(tag.keywords);
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
  const [keywords, setKeywords] = useState('');
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
      keywords: tag.keywords,
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
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Tag title',
      options: null,
      rows: null,
      helperText: null,
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      placeholder: 'Description',
      options: null,
      rows: 3,
      helperText: null,
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      placeholder: 'Keywords',
      options: null,
      rows: 3,
      helperText: 'Use commas to separate the keywords',
    },
    {
      component: Dropdown,
      name: 'languageId',
      type: null,
      placeholder: 'Language',
      options: languageOptions,
      rows: null,
      helperText: null,
    },
  ];

  const deleteButton = tagId ? (
    <Button
      variant="contained"
      color="secondary"
      className={styles.DeleteButton}
      onClick={() => setShowDialog(true)}
    >
      <DeleteIcon className={styles.DeleteIcon} />
      Remove
    </Button>
  ) : null;

  let form = (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          label: label,
          description: description,
          keywords: keywords,
          languageId: languageId,
        }}
        validate={(values) => {
          const errors: Partial<any> = {};
          if (!values.label) {
            errors.label = 'Required';
          } else if (values.label.length > 50) {
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
          <Form className={styles.Form}>
            {formFields.map((field, index) => {
              return (
                <Field
                  key={index}
                  component={field.component}
                  name={field.name}
                  placeholder={field.placeholder}
                  type={field.type}
                  options={field.options}
                  rows={field.rows}
                  helperText={field.helperText}
                ></Field>
              );
            })}
            <div className={styles.Buttons}>
              <Button
                variant="contained"
                color="primary"
                onClick={submitForm}
                className={styles.Button}
              >
                Save
              </Button>
              <Button variant="contained" color="default" onClick={cancelHandler}>
                Cancel
              </Button>
              {deleteButton}
            </div>
          </Form>
        )}
      </Formik>
    </>
  );

  const handleDeleteTag = () => {
    deleteTag({ variables: { id: tagId } });
    setNotification(client, 'Tag deleted Successfully');
    setFormSubmitted(true);
  };
  let dialogBox;

  if (showDialog) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to delete the tag?`}
        handleOk={handleDeleteTag}
        handleCancel={() => setShowDialog(false)}
        colorOk="secondary"
        alignButtons={styles.ButtonsCenter}
      >
        <p className={styles.DialogText}>You won't be able to use this for tagging messages.</p>
      </DialogBox>
    );
  }

  const heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled={true} className={styles.Icon}>
        <TagIcon className={styles.TagIcon} />
      </IconButton>
      {tagId ? 'Edit tag ' : 'Add a new tag'}
    </Typography>
  );

  return (
    <div className={styles.TagAdd}>
      {dialogBox}
      {heading}
      {form}
    </div>
  );
};
