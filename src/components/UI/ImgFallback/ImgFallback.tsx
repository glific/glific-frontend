import { useEffect, useRef, useState } from 'react';
import FallbackImage from 'assets/images/imageError.png';

type ImgProps = {
  src: string;
  alt?: string;
  style?: any;
  onClick?: any;
};

const ImgFallback = ({ src, alt, ...rest }: ImgProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const imgRef: any = useRef<HTMLImageElement>();

  useEffect(() => {
    setImgSrc(src || FallbackImage);
  }, [src]);

  return (
    <img
      {...rest}
      alt={alt}
      ref={imgRef}
      src={imgSrc}
      data-testid="image-fallback"
      onLoad={() => {
        if (imgRef.current?.clientWidth === 0) {
          setImgSrc(FallbackImage);
        }
      }}
      onError={() => {
        setImgSrc(FallbackImage);
      }}
    />
  );
};

export default ImgFallback;
