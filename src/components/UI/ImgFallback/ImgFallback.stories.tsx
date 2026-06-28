import type { Meta, StoryObj } from '@storybook/react-vite';
import ImgFallback from './ImgFallback';
import sampleImage from '../../../assets/images/phone.png';

const meta: Meta<typeof ImgFallback> = {
  title: 'UI/ImgFallback',
  component: ImgFallback,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImgFallback>;

export const ValidImage: Story = {
  args: {
    src: sampleImage,
    alt: 'Sample image',
    style: { borderRadius: 8 },
  },
};

export const BrokenImage: Story = {
  args: {
    src: '/this-path-does-not-exist.png',
    alt: 'Broken image — shows fallback',
  },
};
