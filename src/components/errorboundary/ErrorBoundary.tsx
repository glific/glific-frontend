import { Container } from '@material-ui/core';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import React, { Component } from 'react';

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.log(error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log(error, errorInfo);
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <Container>
          <div data-testid="errorMessage">
            <DialogBox
              title="Error in rendering"
              colorOk="secondary"
              handleOk={() => {}}
              handleCancel={() => {}}
              buttonOk="Ok"
              skipCancel
              alignButtons="center"
              contentAlign="center"
            >
              An error has occurred!
            </DialogBox>
          </div>
        </Container>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
