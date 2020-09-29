import React, { useState } from 'react';
import styles from './Simulator.module.css';
import { ReactComponent as Icon } from '../../assets/images/icons/Contact/Add.svg';

export const Simulator: React.FC = (props) => {
  const [showSimulator, setShowSimulator] = useState(false);
  const contextExplorerVisible = false;
  const simulator = (
    <div id="sim_container" className={styles.sim_container}>
      <div>
        <div id="simulator" className={styles.simulator} key={'sim'}>
          {/* {this.getContextExplorer()} */}

          <div className={styles.screen}>
            <div className={styles.header}>
              <div className={styles.close + ' fe-x'} />
            </div>
            <div className={styles.messages}>
              {/* {messages} */}
              <div
                id="bottom"
                style={{ float: 'left', clear: 'both', marginTop: 20 }}
                // ref={this.bottomRef}
              />
            </div>
            <div className={styles.controls}>
              <input
                // ref={this.inputBoxRef}
                type="text"
                // onKeyUp={this.onKeyUp}
                // disabled={this.state.sprinting}
                // placeholder={this.state.active ? 'Enter message' : 'Press home to start again'}
              />
              <div className={styles.show_attachments_button}>
                <div
                  className="fe-paperclip"
                  // onClick={() => {
                  //   this.setState({
                  //     attachmentOptionsVisible: true,
                  //     drawerOpen: false,
                  //   });
                  // }}
                />
              </div>
            </div>
            {/* {this.getAttachmentOptions()}
            {this.getDrawer()} */}
            <div className={styles.footer}>
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
                className={styles.reset + ' ' + (true ? styles.active : styles.inactive)}
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
      <Icon
        className={styles.SimulatorIcon}
        onClick={() => setShowSimulator(!showSimulator)}
      ></Icon>
    </>
  );
};
