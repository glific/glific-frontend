import React, { useState } from 'react';
import styles from './Simulator.module.css';
import { ReactComponent as SimulatorIcon } from '../../assets/images/icons/Simulator.svg';
import SendIcon from '@material-ui/icons/Send';
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DefaultWhatsappImage from '../../assets/images/whatsappDefault.jpg';
import { useMutation } from '@apollo/client';
import { CREATE_AND_SEND_MESSAGE_MUTATION } from '../../graphql/mutations/Chat';
import CameraAltIcon from '@material-ui/icons/CameraAlt';

export const Simulator: React.FC = (props) => {
  const [showSimulator, setShowSimulator] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const [SendMessage] = useMutation(CREATE_AND_SEND_MESSAGE_MUTATION);

  const getStyleForDirection = (direction: string): string => {
    return direction === 'send' ? styles.send_msg : styles.msg_received;
  };

  const renderMessage = (text: string, direction: string): JSX.Element => {
    return (
      <div className={getStyleForDirection(direction)} key={text}>
        {text
          ? text.split('\n').map((item, key) => {
              return (
                <div key={key} className={styles.msg_text}>
                  {item}
                </div>
              );
            })
          : null}
      </div>
    );
  };

  const message = [
    renderMessage('hey there what is up', 'received'),
    renderMessage('Nothing much what about you', 'send'),
    renderMessage('Just chilling in the garden', 'received'),
    renderMessage(
      'Have you heard about glific the supercool open source application for NGO',
      'send'
    ),
  ];

  const sendMessage = () => {
    SendMessage({
      variables: {
        input: {
          body: inputMessage,
          flow: 'INBOUND',
          receiverId: '2',
          senderId: '1',
          type: 'TEXT',
        },
      },
    });
    setInputMessage('');
  };

  const contextExplorerVisible = false;
  const simulator = (
    <div className={styles.SimContainer}>
      <div>
        <div id="simulator" className={styles.Simulator}>
          {/* {this.getContextExplorer()} */}

          <div className={styles.Screen}>
            <div className={styles.Header}>
              <ArrowBackIcon />
              <img src={DefaultWhatsappImage} alt="default Image" />
              Simulated Beneficiary
            </div>
            <div className={styles.Messages}>
              {message}
              <div
                id="bottom"
                style={{ float: 'left', clear: 'both', marginTop: 20 }}
                // ref={this.bottomRef}
              />
            </div>
            <div className={styles.Controls}>
              <div>
                <input
                  // ref={this.inputBoxRef}
                  type="text"
                  // onKeyUp={this.onKeyUp}
                  // disabled={this.state.sprinting}
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
            {/* {this.getAttachmentOptions()}
            {this.getDrawer()} */}
            <div className={styles.Footer}>
              {!contextExplorerVisible ? (
                <div className={styles.show_context_button}>
                  <div
                    className="context-button"
                    // onClick={() => {
                    //   this.setState({
                    //     contextExplorerVisible: true,
                    //   });
                    // }}
                  >
                    <span className="fe-at-sign"></span>
                  </div>
                </div>
              ) : (
                <div className={styles.show_context_button}>
                  <div
                    className="context-button"
                    // onClick={() => {
                    //   this.setState({
                    //     contextExplorerVisible: false,
                    //   });
                    // }}
                  >
                    <span className="fe-x"></span>
                  </div>
                </div>
              )}

              <span
                className={styles.Reset + ' ' + (true ? styles.active : styles.inactive)}
                // onClick={this.onReset}
              />
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
