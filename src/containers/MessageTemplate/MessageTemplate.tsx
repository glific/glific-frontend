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
import { GET_TEMPLATE, FILTER_TEMPLATES } from '../../graphql/queries/Template';
import { GET_LANGUAGES } from '../../graphql/queries/Tag';
import { setNotification } from '../../common/notification';
import { UPDATE_TEMPLATE, CREATE_TEMPLATE } from '../../graphql/mutations/Template';

export interface TemplateProps {
  match: any;
}

export const MessageTemplate: React.SFC<TemplateProps> = (props) => {
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
      console.log(
        templates,
        templates.sessionTemplates.concat(createSessionTemplate.sessionTemplate)
      );
      cache.writeQuery({
        query: FILTER_TEMPLATES,
        variables: queryVariables,
        data: {
          sessionTemplates: templates.sessionTemplates.concat(
            createSessionTemplate.sessionTemplate
          ),
        },
      });
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

    console.log(payload);
    let notificationMessage;

    if (templateId) {
      updateTemplate({
        variables: {
          id: templateId,
          input: payload,
        },
      });
      notificationMessage = 'Template edited successfully!';
    } else {
      createTemplate({
        variables: {
          input: payload,
        },
      });
      notificationMessage = 'Template added successfully!';
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
    { component: Input, name: 'label', type: 'text', label: 'Label', options: null },
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
        onSubmit={(template) => {
          saveHandler(template);
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
    <div className={styles.TemplateAdd}>
      <h3>{templateId ? 'Edit template information' : 'Enter template information'}</h3>
      {form}
    </div>
  );
};
