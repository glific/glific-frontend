import { ApolloLink, Observable } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';

import { WebPreview } from './WebPreview';

/** Records every operation so the "preview issues no network" invariant can be asserted. */
const renderPreview = (props: any, operations: string[] = []) => {
  const link = new ApolloLink((operation) => {
    operations.push(operation.operationName);
    return new Observable((observer) => observer.complete());
  });

  render(
    <MockedProvider link={link}>
      <WebPreview {...props} />
    </MockedProvider>
  );
  return operations;
};

test('renders a plain sample message in web-widget chrome', () => {
  renderPreview({ message: { type: 'TEXT', body: 'Hello there' } });

  expect(screen.getByTestId('webPreview')).toBeInTheDocument();
  expect(screen.getByTestId('webPreviewMessage')).toHaveTextContent('Hello there');
});

test('renders an interactive template without wiring any handlers', () => {
  renderPreview({
    interactiveMessage: {
      templateType: 'QUICK_REPLY',
      interactiveContent: JSON.stringify({
        type: 'quick_reply',
        content: { type: 'text', text: 'Pick one', header: 'Title' },
        options: [{ type: 'text', title: 'Yes' }],
      }),
    },
  });

  expect(screen.getByText('Yes')).toBeInTheDocument();
});

test('issues no network at all — this is what keeps a form from consuming a simulator', () => {
  const operations = renderPreview({ message: { type: 'TEXT', body: 'Hello there' } });

  expect(operations).toEqual([]);
});

test('renders nothing in the bubble when there is no sample yet', () => {
  renderPreview({});

  expect(screen.getByTestId('webPreviewMessages')).toBeEmptyDOMElement();
});
