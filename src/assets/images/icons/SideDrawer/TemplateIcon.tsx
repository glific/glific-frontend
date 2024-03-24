const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18}>
    <title>{'Icon/Template/Unselected'}</title>
    <g fill="none" fillRule="evenodd" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" d="M16 13h-3.937v2.274a1 1 0 0 1-1.666.746L7.01 13h0-5.027" />
      <rect width={6} height={4} x={2} y={5} rx={2} />
      <path strokeLinecap="round" d="M1.983 1.5H16M12 5h4M12 8.5h4" />
    </g>
  </svg>
);
export default SvgComponent;
