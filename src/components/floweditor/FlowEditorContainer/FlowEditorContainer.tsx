import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AUTOMATION } from '../../../graphql/queries/Automation';
import { FlowEditor } from '../FlowEditor';
import styles from './FlowEditorContainer.module.css';
import { ReactComponent as HelpIcon } from '../../../assets/images/icons/Help.svg';
import { Button } from '../../UI/Form/Button/Button';
import { PUBLISH_AUTOMATION } from '../../../graphql/mutations/Automation';
import { Redirect } from 'react-router';

export interface FlowEditorContainerProps {
  match: any;
}

export const FlowEditorContainer = (props: FlowEditorContainerProps) => {
  const { data } = useQuery(GET_AUTOMATION, { variables: { id: props.match.params.id } });
  const [publishFlow] = useMutation(PUBLISH_AUTOMATION);
  const [published, setPublished] = useState(false);
  let uuid, id: any;
  if (data) {
    id = data.flow.flow.id;
    uuid = data.flow.flow.uuid;
  }

  const handlePublishFlow = () => {
    publishFlow({ variables: { id: id } });
    setPublished(true);
  };

  if (published) {
    return <Redirect to="/automation" />;
  }

  return (
    <>
      <a
        href="https://app.rapidpro.io/video/"
        className={styles.Link}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="helpButton"
      >
        <HelpIcon className={styles.HelpIcon} />
      </a>
      <Button
        variant="contained"
        color="primary"
        className={styles.Button}
        data-testid="button"
        onClick={handlePublishFlow}
      >
        Done
      </Button>
      {uuid ? <FlowEditor uuid={uuid} /> : null};
    </>
  );
};
