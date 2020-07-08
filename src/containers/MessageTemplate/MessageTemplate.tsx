import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { Button } from '../../components/UI/Form/Button/Button';
import { Input } from '../../components/UI/Form/Input/Input';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { useApolloClient } from '@apollo/client';
import styles from './MessageTemplate.module.css';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TEMPLATE, FILTER_TEMPLATES } from '../../graphql/queries/Template';
import { GET_LANGUAGES } from '../../graphql/queries/Tag';
import { setNotification } from '../../common/notification';
import { UPDATE_TEMPLATE, CREATE_TEMPLATE } from '../../graphql/mutations/Template';
import { Typography, IconButton } from '@material-ui/core';
import { ReactComponent as SpeedSendIcon } from '../../assets/images/icons/SpeedSend/Selected.svg';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/White.svg';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { DELETE_TEMPLATE } from '../../graphql/mutations/Template';

export interface TemplateProps {
  match: any;
}

export const MessageTemplate: React.SFC<TemplateProps> = (props) => {
  const [showDialog, setShowDialog] = useState(false);
  const [deleteTemplate] = useMutation(DELETE_TEMPLATE);
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

  const templateId = props.match.params.id ? props.match.params.id : false;
  const { loading, error } = useQuery(GET_TEMPLATE, {
    variables: { id: templateId },
    skip: !templateId,
    onCompleted: (data) => {
      if (templateId && data) {
        template = data.sessionTemplate.sessionTemplate;
        setLabel(template.label);
        setBody(template.body);
        setIsActive(template.isActive);
        setLanguageId(template.language.id);
      }
    },
  });
  const [updateTemplate] = useMutation(UPDATE_TEMPLATE, {
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const [label, setLabel] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [createTemplate] = useMutation(CREATE_TEMPLATE, {
    update(cache, { data: { createSessionTemplate } }) {
      const templates: any = cache.readQuery({
        query: FILTER_TEMPLATES,
        variables: queryVariables,
      });

      if (createSessionTemplate) {
        cache.writeQuery({
          query: FILTER_TEMPLATES,
          variables: queryVariables,
          data: {
            sessionTemplates: templates.sessionTemplates.concat(
              createSessionTemplate.sessionTemplate
            ),
          },
        });
      }
    },
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const client = useApolloClient();

  let template: any = null;

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  const saveHandler = (template: any) => {
    const payload = {
      label: template.label,
      body: template.body,
      isActive: template.isActive,
      languageId: Number(template.languageId),
      type: 'TEXT',
    };
    let notificationMessage;

    if (templateId) {
      updateTemplate({
        variables: {
          id: templateId,
          input: payload,
        },
      });
      notificationMessage = 'Speed send edited successfully!';
    } else {
      createTemplate({
        variables: {
          input: payload,
        },
      });
      notificationMessage = 'Speed send added successfully!';
    }
    setNotification(client, notificationMessage);
  };

  const cancelHandler = () => {
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return <Redirect to="/speed-send" />;
  }

  const languageOptions = languages.data ? languages.data.languages : null;
  const formFields = [
    { component: Input, name: 'label', placeholder: 'Title', options: null, row: null },
    { component: Input, name: 'body', placeholder: 'Message', options: null, row: 3 },
    {
      component: Dropdown,
      name: 'languageId',
      placeholder: 'Language',
      options: languageOptions,
      row: null,
    },
  ];

  const deleteButton = templateId ? (
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
          body: body,
          languageId: languageId,
        }}
        validate={(values) => {
          const errors: Partial<any> = {};
          if (!values.label) {
            errors.label = 'Required';
          } else if (values.label.length > 50) {
            errors.label = 'Too Long';
          }
          if (!values.body) {
            errors.body = 'Required';
          }
          return errors;
        }}
        onSubmit={(template) => {
          saveHandler(template);
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
                  options={field.options}
                  rows={field.row}
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

  const handleDeleteTemplate = () => {
    deleteTemplate({ variables: { id: templateId } });
    setNotification(client, 'Speed send deleted successfully');
    setFormSubmitted(true);
  };

  let dialogBox;
  if (showDialog) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to remove speed send?`}
        handleOk={handleDeleteTemplate}
        handleCancel={() => setShowDialog(false)}
        colorOk="secondary"
        alignButtons={styles.ButtonsCenter}
      >
        <p className={styles.DialogText}>
          It will stop showing when you are drafting a customized message
        </p>
      </DialogBox>
    );
  }

  const heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled={true} className={styles.Icon}>
        <SpeedSendIcon className={styles.SpeedSendIcon} />
      </IconButton>
      {templateId ? 'Edit speed send message' : 'Add a new speed send message'}
    </Typography>
  );

  return (
    <div className={styles.TemplateAdd}>
      {dialogBox}
      {heading}
      {form}
    </div>
  );
};
