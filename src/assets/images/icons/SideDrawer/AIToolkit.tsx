const SvgComponent = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        d="M5.76758 12H4L6.62695 4.89062H7.74512L7.56934 6.38477L5.76758 12ZM7.2373 6.38477L7.04199 4.89062H8.16992L10.8115 12H9.04395L7.2373 6.38477ZM9.00488 10.6768H5.28418V9.33887H9.00488V10.6768ZM13.1357 12H11.4854V4.89062H13.1357V12Z"
        fill={color}
      />
    </g>
    <rect x="0.75" y="0.75" width="16.5" height="16.5" rx="2.25" stroke={color} strokeWidth="1.5" />
  </svg>
);
export default SvgComponent;
