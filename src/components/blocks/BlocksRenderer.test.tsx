import { cleanup, render, screen } from '@testing-library/react';
import { BlocksRenderer, hasBlockPreview } from './BlocksRenderer';

afterEach(cleanup);

const T = (value: string) => ({ kind: 'text', value });
const A = (value: string) => ({ kind: 'alt', value });
const I = (value: string) => ({ kind: 'image', value });
const L = (value: any[]) => ({ kind: 'list', value });
const B = (value: boolean) => ({ kind: 'boolean', value });

const envelope = (component: string, props: any) => ({ type: 'blocks', version: 1, component, props });

describe('BlocksRenderer', () => {
  test('renders an image panel from a TYPED payload, unwrapping client-side', () => {
    render(
      <BlocksRenderer
        content={envelope('glific/image-panel', {
          id: 'course',
          body: T('Pick a course'),
          options: L([
            { id: 'c1', image: I('https://x/a.png'), image_alt: A('Adult English class'), label: T('Spoken English') },
          ]),
        })}
      />
    );

    expect(screen.getByTestId('blocksImagePanel')).toBeInTheDocument();
    expect(screen.getByTestId('blocksBody')).toHaveTextContent('Pick a course');
    expect(screen.getByText('Spoken English')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Adult English class');
  });

  test('renders an already-unwrapped payload identically', () => {
    render(
      <BlocksRenderer
        content={{
          type: 'blocks',
          component: 'glific/image-panel',
          props: { id: 'course', options: [{ id: 'c1', image: 'https://x/a.png', label: 'Spoken English' }] },
        }}
      />
    );
    expect(screen.getByText('Spoken English')).toBeInTheDocument();
  });

  test('renders a carousel card per entry', () => {
    render(
      <BlocksRenderer
        content={envelope('glific/carousel', {
          id: 'product',
          body: T('Browse our courses'),
          cards: L([
            { id: 'p1', image: I('https://x/a.png'), title: T('Course A'), description: T('Six weeks') },
            { id: 'p2', image: I('https://x/b.png'), title: T('Course B') },
          ]),
        })}
      />
    );

    expect(screen.getAllByTestId('carouselCard')).toHaveLength(2);
    expect(screen.getByText('Six weeks')).toBeInTheDocument();
  });

  test('renders a form field per entry with a submit label', () => {
    render(
      <BlocksRenderer
        content={envelope('glific/form', {
          id: 'signup',
          fields: L([
            { id: 'name', label: T('Your name'), placeholder: T('Asha'), required: B(true) },
            { id: 'city', label: T('Your city') },
          ]),
          submit_label: T('Send it'),
        })}
      />
    );

    expect(screen.getAllByTestId('formField')).toHaveLength(2);
    expect(screen.getByTestId('formSubmit')).toHaveTextContent('Send it');
  });

  test('an image with no alt node renders an empty alt attribute', () => {
    const { container } = render(
      <BlocksRenderer
        content={envelope('glific/image-panel', {
          id: 'course',
          options: L([{ id: 'c1', image: I('https://x/a.png'), label: T('A') }]),
        })}
      />
    );
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  // §6 — a Custom Block is rendered by the org's own component in the widget, not here
  test('shows "This block has no preview" for a Custom Block', () => {
    render(<BlocksRenderer content={envelope('tap/course-picker', { id: 'x', body: T('Pick something') })} />);

    expect(screen.getByTestId('blocksNoPreview')).toHaveTextContent('This block has no preview');
    expect(screen.getByTestId('blocksBody')).toHaveTextContent('Pick something');
  });

  test('shows the answered state written into the outbound content', () => {
    render(
      <BlocksRenderer
        content={{
          ...envelope('glific/carousel', {
            id: 'p',
            cards: L([{ id: 'p1', image: I('https://x/a.png'), title: T('A') }]),
          }),
          answered: true,
          answer_summary: 'Course A',
        }}
      />
    );

    expect(screen.getByTestId('blocksRenderer')).toHaveAttribute('data-answered', 'true');
    expect(screen.getByTestId('blocksAnswered')).toHaveTextContent('Answered: Course A');
  });

  test('is never clickable', () => {
    render(
      <BlocksRenderer
        content={envelope('glific/carousel', {
          id: 'p',
          cards: L([{ id: 'p1', image: I('https://x/a.png'), title: T('A') }]),
        })}
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('tolerates missing optional values at runtime', () => {
    render(<BlocksRenderer content={envelope('glific/form', {})} />);
    expect(screen.getByTestId('formSubmit')).toHaveTextContent('Submit');
  });
});

describe('hasBlockPreview', () => {
  test('is true only for the built-in blocks', () => {
    expect(hasBlockPreview('glific/carousel')).toBe(true);
    expect(hasBlockPreview('tap/anything')).toBe(false);
    expect(hasBlockPreview(undefined)).toBe(false);
  });
});
