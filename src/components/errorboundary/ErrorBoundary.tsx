import { Container } from '@mui/material';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import setLogs from 'config/logs';
import { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';
import * as Sentry from '@sentry/react';

function withRouter(NavigateComponent: any) {
  return function WrappedComponent(props: any) {
    const navigate = useNavigate();
    return <NavigateComponent {...props} navigate={navigate} />;
  };
}

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    const errorString = JSON.stringify(error);
    setLogs(errorString, 'error');

    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    const errorString = JSON.stringify(error);
    setLogs(errorString, 'error');
    setLogs(errorInfo, 'error');
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { children, navigate } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <Sentry.ErrorBoundary>
          <Container>
            <div data-testid="errorMessage">
              <DialogBox
                title="Error !"
                colorCancel="warning"
                handleOk={() => {
                  window.location.reload();
                }}
                handleCancel={() => {
                  navigate('/logout/user');
                }}
                buttonOk="Retry"
                buttonCancel="Logout"
                alignButtons="center"
                contentAlign="center"
              >
                <div className={styles.Dialog}>
                  Sorry, An error occurred!
                  <br /> Please contact the team for support.
                </div>
              </DialogBox>
            </div>
          </Container>
        </Sentry.ErrorBoundary>
      );
    }

    return children;
  }
}

export default withRouter(ErrorBoundary);
