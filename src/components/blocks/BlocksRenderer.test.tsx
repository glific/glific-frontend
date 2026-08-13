import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
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

  // §2.2 — unwrap is scoped to props, so what the staff sees is unchanged by a kind/value-shaped
  // map in context, and that map is never collapsed on its way through the renderer
  test('renders identically whatever context carries, and leaves context alone', () => {
    const props = { id: 'course', options: L([{ id: 'c1', image: I('https://x/a.png'), label: T('Spoken English') }]) };
    const context = { ticket: { kind: 'crm-ref', value: 'AB-12' } };

    const plain = render(<BlocksRenderer content={envelope('glific/image-panel', props)} />).container.innerHTML;
    cleanup();
    const withContext = render(<BlocksRenderer content={{ ...envelope('glific/image-panel', props), context }} />)
      .container.innerHTML;

    expect(withContext).toBe(plain);
    expect(context).toEqual({ ticket: { kind: 'crm-ref', value: 'AB-12' } });
  });

  // §9 — the derived body of a Custom Block comes from props only
  test('the no-preview body ignores text nodes parked in context', () => {
    render(
      <BlocksRenderer
        content={{ ...envelope('tap/course-picker', { body: T('Pick something') }), context: { note: T('Internal') } }}
      />
    );
    expect(screen.getByTestId('blocksBody')).toHaveTextContent('Pick something');
    expect(screen.queryByText(/Internal/)).not.toBeInTheDocument();
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

describe('BlocksRenderer interactive mode (contract §6)', () => {
  test('is read-only unless `interactive` is passed, so the preview and inbox are unchanged', () => {
    const onRespond = vi.fn();
    render(
      <BlocksRenderer
        content={envelope('glific/image-panel', {
          id: 'course',
          options: L([{ id: 'c1', image: I('https://x/a.png'), label: T('Spoken English') }]),
        })}
        onRespond={onRespond}
      />
    );

    const option = screen.getByTestId('imagePanelOption');
    expect(option).toBeDisabled();
    fireEvent.click(option);
    expect(onRespond).not.toHaveBeenCalled();
  });

  test('image panel: values are keyed by props.id, summary is the option label', () => {
    const onRespond = vi.fn();
    render(
      <BlocksRenderer
        interactive
        onRespond={onRespond}
        content={envelope('glific/image-panel', {
          id: 'course',
          options: L([
            { id: 'c1', image: I('https://x/a.png'), label: T('Spoken English') },
            { id: 'c2', image: I('https://x/b.png'), label: T('Basic Maths') },
          ]),
        })}
      />
    );

    fireEvent.click(screen.getAllByTestId('imagePanelOption')[1]);
    expect(onRespond).toHaveBeenCalledWith({ values: { course: 'c2' }, summary: 'Basic Maths' });
  });

  test('carousel: values are keyed by props.id, summary is the card title', () => {
    const onRespond = vi.fn();
    render(
      <BlocksRenderer
        interactive
        onRespond={onRespond}
        content={envelope('glific/carousel', {
          id: 'product',
          cards: L([{ id: 'p1', image: I('https://x/a.png'), title: T('Course A'), description: T('Evenings') }]),
        })}
      />
    );

    fireEvent.click(screen.getByTestId('carouselSelect'));
    expect(onRespond).toHaveBeenCalledWith({ values: { product: 'p1' }, summary: 'Course A' });
  });

  test('form: every field is in values, but only the filled ones are in the summary', () => {
    const onRespond = vi.fn();
    render(
      <BlocksRenderer
        interactive
        onRespond={onRespond}
        content={envelope('glific/form', {
          id: 'signup',
          fields: L([
            { id: 'name', label: T('Your name') },
            { id: 'city', label: T('Your city') },
          ]),
        })}
      />
    );

    fireEvent.change(screen.getAllByTestId('formField')[0].querySelector('input')!, { target: { value: 'Asha' } });
    fireEvent.click(screen.getByTestId('formSubmit'));

    expect(onRespond).toHaveBeenCalledWith({ values: { name: 'Asha', city: '' }, summary: 'Your name: Asha' });
  });

  test('form: submit stays blocked until every required field is filled', () => {
    render(
      <BlocksRenderer
        interactive
        content={envelope('glific/form', {
          fields: L([{ id: 'name', label: T('Your name'), required: B(true) }]),
        })}
      />
    );

    expect(screen.getByTestId('formSubmit')).toBeDisabled();
    fireEvent.change(screen.getByTestId('formField').querySelector('input')!, { target: { value: 'Asha' } });
    expect(screen.getByTestId('formSubmit')).not.toBeDisabled();
  });

  test('an already-answered block is not re-answerable', () => {
    render(
      <BlocksRenderer
        interactive
        content={{
          ...envelope('glific/image-panel', {
            id: 'course',
            options: L([{ id: 'c1', image: I('https://x/a.png'), label: T('Spoken English') }]),
          }),
          answered: true,
          answer_summary: 'Spoken English',
        }}
      />
    );

    expect(screen.getByTestId('imagePanelOption')).toBeDisabled();
    expect(screen.getByTestId('blocksAnswered')).toHaveTextContent('Spoken English');
  });

  test('a blank summary is never emitted — it becomes the message body (§6)', () => {
    const onRespond = vi.fn();
    render(
      <BlocksRenderer
        interactive
        onRespond={onRespond}
        content={envelope('glific/image-panel', {
          id: 'course',
          options: L([{ id: 'c1', image: I('https://x/a.png'), label: T('') }]),
        })}
      />
    );

    fireEvent.click(screen.getByTestId('imagePanelOption'));
    expect(onRespond).toHaveBeenCalledWith({ values: { course: 'c1' }, summary: 'c1' });
  });
});

describe('hasBlockPreview', () => {
  test('is true only for the built-in blocks', () => {
    expect(hasBlockPreview('glific/carousel')).toBe(true);
    expect(hasBlockPreview('tap/anything')).toBe(false);
    expect(hasBlockPreview(undefined)).toBe(false);
  });
});
