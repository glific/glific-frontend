import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { Button } from '../../components/UI/Form/Button/Button';
import { Input } from '../../components/UI/Form/Input/Input';
import { Checkbox } from '../../components/UI/Form/Checkbox/Checkbox';
import { Dropdown } from '../../components/UI/Form/Dropdown/Dropdown';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { useApolloClient } from '@apollo/client';
import styles from './MessageTemplate.module.css';
import { useQuery, useMutation } from '@apollo/client';
import Paper from '@material-ui/core/Paper';
import { GET_MESSAGE, FILTER_MESSAGES } from '../../graphql/queries/Message';
import { GET_LANGUAGES } from '../../graphql/queries/Tag';
import { setNotification } from '../../common/notification';
import { UPDATE_MESSAGE, CREATE_MESSAGE } from '../../graphql/mutations/Message';

export interface MessageProps {
  match: any;
}

export const MessageTemplate: React.SFC<MessageProps> = (props) => {
  const queryVariables = {
    filter: {
      label: '',
    },
    order: 'ASC',
  };
  const languages = useQuery(GET_LANGUAGES, {
    onCompleted: (data) => {
      setLanguageId(data.languages[0].id);
    },
  });

  const messageId = props.match.params.id ? props.match.params.id : false;
  const { loading, error } = useQuery(GET_MESSAGE, {
    variables: { id: messageId },
    skip: !messageId,
    onCompleted: (data) => {
      if (messageId && data) {
        message = data.sessionTemplate.sessionTemplate;
        setLabel(message.label);
        setBody(message.body);
        setIsActive(message.isActive);
        setLanguageId(message.language.id);
      }
    },
  });
  const [updateMessage] = useMutation(UPDATE_MESSAGE, {
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const [label, setLabel] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [languageId, setLanguageId] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [createMessage] = useMutation(CREATE_MESSAGE, {
    update(cache, { data: { createSessionTemplate } }) {
      const messages: any = cache.readQuery({
        query: FILTER_MESSAGES,
        variables: queryVariables,
      });
      console.log(
        messages,
        messages.sessionTemplates.concat(createSessionTemplate.sessionTemplate)
      );
      cache.writeQuery({
        query: FILTER_MESSAGES,
        variables: queryVariables,
        data: {
          sessionTemplates: messages.sessionTemplates.concat(createSessionTemplate.sessionTemplate),
        },
      });
    },
    onCompleted: () => {
      setFormSubmitted(true);
    },
  });

  const client = useApolloClient();

  let message: any = null;

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  const saveHandler = (message: any) => {
    const payload = {
      label: message.label,
      body: message.body,
      isActive: message.isActive,
      languageId: Number(message.languageId),
      type: 'TEXT',
    };

    console.log(payload);
    let notificationMessage;

    if (messageId) {
      updateMessage({
        variables: {
          id: messageId,
          input: payload,
        },
      });
      notificationMessage = 'Message edited successfully!';
    } else {
      createMessage({
        variables: {
          input: payload,
        },
      });
      notificationMessage = 'Message added successfully!';
    }
    setNotification(client, notificationMessage);
  };

  const cancelHandler = () => {
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return <Redirect to="/template" />;
  }

  const languageOptions = languages.data ? languages.data.languages : null;
  const formFields = [
    { component: Input, name: 'label', type: 'text', label: 'label', options: null },
    { component: Input, name: 'body', type: 'text', label: 'Body', options: null },
    { component: Checkbox, name: 'isActive', type: 'checkbox', label: 'Is Active', options: null },

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
          body: body,
          isActive: isActive,
          languageId: languageId,
        }}
        validate={(values) => {
          const errors: Partial<any> = {};
          if (!values.label) {
            errors.label = 'Required';
          } else if (values.label.length > 10) {
            errors.label = 'Too Long';
          }
          if (!values.body) {
            errors.body = 'Required';
          }
          return errors;
        }}
        onSubmit={(message) => {
          saveHandler(message);
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
    <div className={styles.MessageAdd}>
      <h3>{messageId ? 'Edit message information' : 'Enter message information'}</h3>
      {form}
    </div>
  );
};
