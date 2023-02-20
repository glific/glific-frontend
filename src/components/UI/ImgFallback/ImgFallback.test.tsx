import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import ImgFallback from './ImgFallback';

const props: any = () => ({
  src: 'http://test.com',
  alt: 'fallback',
  onClick: jest.fn(),
});

describe('Image fallback', () => {
  const wrapper = <ImgFallback {...props()} />;

  it('renders ImgFallback component', async () => {
    render(wrapper);
    const image = screen.getByTestId('image-fallback');
    expect(image).toBeInTheDocument();
  });

  it('should load fallback image if the url is not correct', async () => {
    render(wrapper);
    const image = screen.getByTestId('image-fallback');
    fireEvent.error(image);
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'imageError.png');
    });
  });

  it('should load fallback image if the clienwidth is 0', async () => {
    render(wrapper);
    const image = screen.getByTestId('image-fallback');
    fireEvent.load(image);
    await waitFor(() => {
      expect(image).toHaveAttribute('src', 'imageError.png');
    });
  });
});
