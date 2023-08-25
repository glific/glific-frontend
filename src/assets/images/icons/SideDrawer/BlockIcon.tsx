const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18}>
    <title>{'Icon/Block'}</title>
    <g fill="none" fillRule="evenodd" stroke={color} strokeWidth={2}>
      <circle cx={9} cy={9} r={8} />
      <path strokeLinecap="round" d="m3 14 12-9" />
    </g>
  </svg>
);
export default SvgComponent;
