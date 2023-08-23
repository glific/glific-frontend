const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={17} height={15} fill="none">
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.273 9.666c1.506 0 2.727 1.293 2.727 2.889v1.444h-1.364M11.227 6.688c1.177-.321 2.046-1.452 2.046-2.798s-.87-2.478-2.046-2.798M6.455 6.778c1.506 0 2.727-1.294 2.727-2.89C9.182 2.294 7.961 1 6.455 1 4.949 1 3.728 2.293 3.728 3.889c0 1.595 1.22 2.889 2.727 2.889ZM9.182 9.666H3.727C2.221 9.666 1 10.959 1 12.555v1.444h10.91v-1.444c0-1.596-1.222-2.889-2.728-2.889Z"
    />
  </svg>
);
export default SvgComponent;
