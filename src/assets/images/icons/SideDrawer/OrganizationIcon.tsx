const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={15} fill="none">
    <path
      fill={color}
      d="M0 15V0h8v3.333h8V15H0Zm1.6-1.667h4.8v-1.666H1.6v1.666ZM1.6 10h4.8V8.333H1.6V10Zm0-3.333h4.8V5H1.6v1.667Zm0-3.334h4.8V1.667H1.6v1.666Zm6.4 10h6.4V5H8v8.333Zm1.6-5V6.667h3.2v1.666H9.6Zm0 3.334V10h3.2v1.667H9.6Z"
    />
  </svg>
);
export default SvgComponent;
