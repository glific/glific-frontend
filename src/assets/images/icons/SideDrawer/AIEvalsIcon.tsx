const SvgComponent = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm16-5 1.41 1.41-7.07 7.08-3.54-3.54 1.41-1.41 2.12 2.12z"
      fill={color}
    />
  </svg>
);

export default SvgComponent;
