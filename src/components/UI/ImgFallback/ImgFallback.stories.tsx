import type { Meta, StoryObj } from '@storybook/react-vite';
import ImgFallback from './ImgFallback';

const meta: Meta<typeof ImgFallback> = {
  title: 'UI/ImgFallback',
  component: ImgFallback,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImgFallback>;

export const ValidImage: Story = {
  args: {
    src: 'https://picsum.photos/200/150',
    alt: 'Sample image',
    style: { borderRadius: 8 },
  },
};

export const BrokenImage: Story = {
  args: {
    src: 'https://broken-url.example.com/image.png',
    alt: 'Broken image — shows fallback',
  },
};
