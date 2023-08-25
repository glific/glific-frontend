const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18}>
    <title>{'Icon/Notification/Inactive'}</title>
    <g fill="none" fillRule="evenodd" strokeWidth={2}>
      <path
        stroke={color}
        d="M8.993 1a4.855 4.855 0 0 1 4.855 4.855v3.949h.06c1.155 0 2.092.936 2.092 2.092a2.097 2.097 0 0 1-2.092 2.097L10.91 14l.094.731A2.01 2.01 0 0 1 9.01 17a1.979 1.979 0 0 1-1.958-2.264L7.159 14l-3.067-.007A2.097 2.097 0 0 1 2 11.896c0-1.156.937-2.092 2.092-2.092h.046v-3.95A4.855 4.855 0 0 1 8.993 1Z"
      />
      <path stroke="#717E78" d="M6 14h6" />
    </g>
  </svg>
);
export default SvgComponent;
