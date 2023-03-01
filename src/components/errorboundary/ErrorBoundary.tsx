import { Container } from '@mui/material';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import setLogs from 'config/logs';
import { Component, ErrorInfo, ReactNode } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';

function withRouter(NavigateComponent: typeof Component) {
  return function WrappedComponent(props: ErrorBoundaryProps) {
    const navigate = useNavigate();
    return <NavigateComponent {...props} navigate={navigate} />;
  };
}

interface ErrorBoundaryProps {
  navigate?: NavigateFunction;
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const errorString = JSON.stringify(error);
    setLogs(errorString, 'error');

    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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
        <Container>
          <div data-testid="errorMessage">
            <DialogBox
              title="Error !"
              colorOk="warning"
              handleOk={() => {
                if (navigate) navigate('/logout/user');
              }}
              handleCancel={() => {}}
              buttonOk="Ok"
              skipCancel
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
      );
    }

    return children;
  }
}

export default withRouter(ErrorBoundary);
