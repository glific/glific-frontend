import React, { useState } from 'react';
import styles from './Simulator.module.css';
import { ReactComponent as SimulatorIcon } from '../../assets/images/icons/Simulator.svg';
import SendIcon from '@material-ui/icons/Send';
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DefaultWhatsappImage from '../../assets/images/whatsappDefault.jpg';

export const Simulator: React.FC = (props) => {
  const [showSimulator, setShowSimulator] = useState(false);
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
            {/* <div className={styles.messages}> */}
            {/* {messages} */}
            {/* <div
                id="bottom"
                style={{ float: 'left', clear: 'both', marginTop: 20 }}
                // ref={this.bottomRef}
              /> */}
            {/* </div> */}
            <div className={styles.Controls}>
              <input
                // ref={this.inputBoxRef}
                type="text"
                // onKeyUp={this.onKeyUp}
                // disabled={this.state.sprinting}
                placeholder={'Type a message'}
              />

              <Button variant="contained" color="primary" className={styles.SendButton}>
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
  return (
    <>
      {showSimulator ? simulator : null}
      <SimulatorIcon
        className={showSimulator ? styles.SimulatorIconClicked : styles.SimulatorIconNormal}
        onClick={() => setShowSimulator(!showSimulator)}
      ></SimulatorIcon>
    </>
  );
};
