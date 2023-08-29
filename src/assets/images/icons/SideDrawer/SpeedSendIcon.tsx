const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18}>
    <title>{'Icon/Speed send/Unselected'}</title>
    <g fill="none" fillRule="evenodd" stroke={color} strokeLinecap="round" strokeWidth={2}>
      <path d="M17 13h-4.937v2.274a1 1 0 0 1-1.666.746L7.01 13h0H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h9.063M9 9h8M7 5h8" />
    </g>
  </svg>
);
export default SvgComponent;
