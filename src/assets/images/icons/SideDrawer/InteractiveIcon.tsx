const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18}>
    <title>{'Speed send/Icon'}</title>
    <g fill="none" fillRule="evenodd">
      <path
        stroke={color}
        strokeWidth={2}
        d="M5.094 7H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4.932"
      />
      <g stroke={color} strokeWidth={2}>
        <path d="m2.715 17.31-.357-.377-.875-.963a1.833 1.833 0 0 1 .065-2.536l.006-.006a1.757 1.757 0 0 1 2.48.006l.865.866a.217.217 0 0 0 .37-.154V6.25a2.05 2.05 0 0 1 4.102 0v8.129" />
        <path d="M9.37 15.379v-2.915a1.943 1.943 0 1 1 3.886 0v2.915M13.256 15.379v-2.233a1.872 1.872 0 0 1 3.744 0v2.233" />
      </g>
      <path fill={color} d="m1.984 18 1.46-1.38L4.75 18z" />
    </g>
  </svg>
);
export default SvgComponent;
