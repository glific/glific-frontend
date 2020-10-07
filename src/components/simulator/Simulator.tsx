import React, { useState, useEffect, useRef } from 'react';
import styles from './Simulator.module.css';
import { ReactComponent as SimulatorIcon } from '../../assets/images/icons/Simulator.svg';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DefaultWhatsappImage from '../../assets/images/whatsappDefault.jpg';
import { useQuery } from '@apollo/client';
import Draggable from 'react-draggable';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import CallIcon from '@material-ui/icons/Call';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VideocamIcon from '@material-ui/icons/Videocam';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import Axios from 'axios';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import { SEARCH_QUERY_VARIABLES } from '../../common/constants';
import moment from 'moment';
import { TIME_FORMAT } from '../../common/constants';
import ClearIcon from '@material-ui/icons/Clear';
import { GUPSHUP_CALLBACK_URL, SIMULATOR_CONTACT } from '../../config';

export interface SimulatorProps {
  showSimulator: boolean;
  setShowSimulator: any;
}

export const Simulator: React.FC<SimulatorProps> = ({
  showSimulator,
  setShowSimulator,
}: SimulatorProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const messageRef: any = useRef<HTMLDivElement>();

  let messages = [];
  let simulatorId = '';

  const { data: allConversations }: any = useQuery(SEARCH_QUERY, {
    variables: SEARCH_QUERY_VARIABLES,
    fetchPolicy: 'cache-first',
  });

  if (allConversations) {
    //currently setting the simulated contact as the default receiver
    const simulatedContact = allConversations.search.filter(
      (item: any) => item.contact.phone === SIMULATOR_CONTACT
    );
    if (simulatedContact.length > 0) {
      messages = simulatedContact[0].messages;
      simulatorId = simulatedContact[0].contact.id;
    }
  }

  const getStyleForDirection = (direction: string): string => {
    return direction === 'send' ? styles.SendMessage : styles.ReceivedMessage;
  };

  const renderMessage = (
    text: string,
    direction: string,
    index: number,
    insertedAt: string
  ): JSX.Element => {
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

        <span>{moment(insertedAt).format(TIME_FORMAT)}</span>
        {direction === 'received' ? <DoneAllIcon /> : null}
      </div>
    );
  };

  const simulatedMessages = messages
    .map((simulatorMessage: any, index: number) => {
      if (simulatorMessage.receiver.id === simulatorId) {
        return renderMessage(simulatorMessage.body, 'send', index, simulatorMessage.insertedAt);
      } else {
        return renderMessage(simulatorMessage.body, 'received', index, simulatorMessage.insertedAt);
      }
    })
    .reverse();

  const sendMessage = () => {
    Axios({
      method: 'POST',
      url: GUPSHUP_CALLBACK_URL,
      data: {
        type: 'message',
        payload: {
          type: 'text',
          payload: {
            text: inputMessage,
          },
          sender: {
            //this number will be the simulated contact number
            phone: SIMULATOR_CONTACT,
            name: 'Simulator',
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
    <Draggable>
      <div className={styles.SimContainer}>
        <div>
          <div id="simulator" className={styles.Simulator}>
            <ClearIcon
              className={styles.ClearIcon}
              onClick={() => setShowSimulator(false)}
              data-testid="clearIcon"
            />
            <div className={styles.Screen}>
              <div className={styles.Header}>
                <ArrowBackIcon />
                <img src={DefaultWhatsappImage} alt="default Image" />
                <span>Beneficiary</span>
                <div>
                  <VideocamIcon />
                  <CallIcon />
                  <MoreVertIcon />
                </div>
              </div>
              <div className={styles.Messages} ref={messageRef}>
                {simulatedMessages}
              </div>
              <div className={styles.Controls}>
                <div>
                  <InsertEmoticonIcon className={styles.Icon} />
                  <input
                    type="text"
                    data-testid="simulatorInput"
                    onKeyPress={(event: any) => {
                      if (event.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                    value={inputMessage}
                    placeholder={'Type a message'}
                    onChange={(event) => setInputMessage(event.target.value)}
                  />
                  <AttachFileIcon className={styles.AttachFileIcon} />
                  <CameraAltIcon className={styles.Icon} />
                </div>

                <Button
                  variant="contained"
                  color="primary"
                  className={styles.SendButton}
                  onClick={() => sendMessage()}
                >
                  <MicIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );

  const handleSimulator = () => {
    setShowSimulator(!showSimulator);
  };

  return (
    <>
      {showSimulator ? simulator : null}
      <SimulatorIcon
        data-testid="simulatorIcon"
        className={showSimulator ? styles.SimulatorIconClicked : styles.SimulatorIconNormal}
        onClick={() => handleSimulator()}
      ></SimulatorIcon>
    </>
  );
};
