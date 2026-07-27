import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContentItem } from '../../FormBuilder.types';
import { TextContent } from './TextContent';

const makeItem = (name: string, text: string): ContentItem => ({
  id: '1',
  name,
  type: 'Text',
  order: 0,
  data: { text },
});

const openTypeSelect = () => {
  const select = screen.getByTestId('text-type-select').querySelector('[role="combobox"]')!;
  fireEvent.mouseDown(select);
};

describe('TextContent', () => {
  it('calls onUpdate with new name when switching type and text fits within new limit', async () => {
    const onUpdate = vi.fn();
    render(<TextContent item={makeItem('Body', 'Short text')} onUpdate={onUpdate} />);

    openTypeSelect();
    fireEvent.click(await screen.findByRole('option', { name: 'Large Heading' }));

    expect(onUpdate).toHaveBeenCalledWith({ name: 'Large Heading' });
  });

  it('truncates text to new limit when switching to a type with a smaller character limit', async () => {
    const onUpdate = vi.fn();
    const longText = 'A'.repeat(100);
    render(<TextContent item={makeItem('Body', longText)} onUpdate={onUpdate} />);

    openTypeSelect();
    fireEvent.click(await screen.findByRole('option', { name: 'Large Heading' }));

    expect(onUpdate).toHaveBeenCalledWith({
      name: 'Large Heading',
      data: { text: 'A'.repeat(80) },
    });
  });

  it('shows correct character limit counter for Body (4096)', () => {
    render(<TextContent item={makeItem('Body', 'hello')} onUpdate={vi.fn()} />);
    expect(screen.getByText('5/4096')).toBeInTheDocument();
  });

  it('shows correct character limit counter for Caption (409)', () => {
    render(<TextContent item={makeItem('Caption', 'hi')} onUpdate={vi.fn()} />);
    expect(screen.getByText('2/409')).toBeInTheDocument();
  });

  it('shows correct character limit counter for Large Heading (80)', () => {
    render(<TextContent item={makeItem('Large Heading', 'test')} onUpdate={vi.fn()} />);
    expect(screen.getByText('4/80')).toBeInTheDocument();
  });
});
