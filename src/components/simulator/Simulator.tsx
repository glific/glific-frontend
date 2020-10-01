import React, { useState, useEffect, useRef } from 'react';
import styles from './Simulator.module.css';
import { ReactComponent as SimulatorIcon } from '../../assets/images/icons/Simulator.svg';
import SendIcon from '@material-ui/icons/Send';
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DefaultWhatsappImage from '../../assets/images/whatsappDefault.jpg';
import { useQuery } from '@apollo/client';

import CameraAltIcon from '@material-ui/icons/CameraAlt';
import Axios from 'axios';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import { SEARCH_QUERY_VARIABLES } from '../../common/constants';

export const Simulator: React.FC = (props) => {
  const [showSimulator, setShowSimulator] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messageRef: any = useRef<HTMLDivElement>();

  let messages = [];

  const { data: allConversations }: any = useQuery(SEARCH_QUERY, {
    variables: SEARCH_QUERY_VARIABLES,
    fetchPolicy: 'cache-first',
  });

  if (allConversations) {
    //currently setting the simulated contact as the default receiver
    const simulatedContact = allConversations.search.filter((item: any) => item.contact.id === '2');
    if (simulatedContact.length > 0) {
      messages = simulatedContact[0].messages;
    }
  }

  const getStyleForDirection = (direction: string): string => {
    return direction === 'send' ? styles.SendMessage : styles.ReceivedMessage;
  };

  const renderMessage = (text: string, direction: string, index: number): JSX.Element => {
    return (
      <div className={getStyleForDirection(direction)} key={index}>
        {text
          ? text.split('\n').map((item, key) => {
              return (
                <div key={key} className={styles.MessageText}>
                  {item}
                </div>
              );
            })
          : null}
      </div>
    );
  };

  const simulatedMessages = messages
    .map((simulatorMessage: any, index: number) => {
      if (simulatorMessage.receiver.id === '2') {
        return renderMessage(simulatorMessage.body, 'send', index);
      } else {
        return renderMessage(simulatorMessage.body, 'received', index);
      }
    })
    .reverse();

  const sendMessage = () => {
    Axios({
      method: 'POST',
      url: 'http://localhost:4000/gupshup',
      data: {
        app: 'Glific',
        timestamp: 1580227766370,
        version: 2,
        type: 'message',
        payload: {
          id: 'ABEGkYaYVSEEAhAL3SLAWwHKeKrt6s3FKB0c',
          source: '917834811231',
          type: 'text',
          payload: {
            text: inputMessage,
          },
          sender: {
            phone: '917834811231',
            name: 'Default receiver',
            country_code: '91',
            dial_code: '7834811231',
          },
        },
      },
    });
    setInputMessage('');
  };

  useEffect(() => {
    const messageContainer: any = messageRef.current;
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  const simulator = (
    <div className={styles.SimContainer}>
      <div>
        <div id="simulator" className={styles.Simulator}>
          <div className={styles.Screen}>
            <div className={styles.Header}>
              <ArrowBackIcon />
              <img src={DefaultWhatsappImage} alt="default Image" />
              Simulated Beneficiary
            </div>
            <div className={styles.Messages} ref={messageRef}>
              {simulatedMessages}
              <div id="bottom" style={{ float: 'left', clear: 'both', marginTop: 20 }} />
            </div>
            <div className={styles.Controls}>
              <div>
                <input
                  type="text"
                  onKeyPress={(e: any) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  value={inputMessage}
                  placeholder={'Type a message'}
                  onChange={(event) => setInputMessage(event.target.value)}
                />
                <CameraAltIcon />
              </div>

              <Button
                variant="contained"
                color="primary"
                className={styles.SendButton}
                onClick={() => sendMessage()}
              >
                <SendIcon />
              </Button>
            </div>

            <div className={styles.Footer}>
              <div className={styles.show_context_button}>
                <div className="context-button">
                  <span className="fe-x"></span>
                </div>
              </div>

              <span className={styles.Reset + ' ' + (true ? styles.active : styles.inactive)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSimulator = () => {
    setShowSimulator(!showSimulator);
  };

  return (
    <>
      {showSimulator ? simulator : null}
      <SimulatorIcon
        className={showSimulator ? styles.SimulatorIconClicked : styles.SimulatorIconNormal}
        onClick={() => handleSimulator()}
      ></SimulatorIcon>
    </>
  );
};
