const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={19} height={18} fill="none">
    <path
      fill={color}
      d="M3.869 3.834A7.354 7.354 0 0 1 8.76 1.996c4.028 0 7.245 3.162 7.245 7.004 0 3.842-3.217 7.004-7.245 7.004-3.156 0-5.823-1.947-6.822-4.64a1 1 0 0 0-1.876.693C1.352 15.535 4.77 18 8.76 18c5.08 0 9.245-4.003 9.245-9S13.839 0 8.76 0a9.352 9.352 0 0 0-6.335 2.445l-.08-.923C2.3.996 1.825.599 1.282.633a.943.943 0 0 0-.898 1.014l.302 3.497a.965.965 0 0 0 .37.675c.214.167.488.242.758.207l3.44-.443a.94.94 0 0 0 .827-1.07c-.081-.523-.582-.89-1.12-.82l-1.092.14Z"
    />
    <path
      fill={color}
      d="M12.613 6.913a.997.997 0 0 1-.06 1.41l-4.57 4.188-3.199-2.293a.997.997 0 0 1-.229-1.393c.322-.448.947-.55 1.396-.228l1.877 1.345 3.372-3.09a1.001 1.001 0 0 1 1.413.061Z"
    />
  </svg>
);
export default SvgComponent;
