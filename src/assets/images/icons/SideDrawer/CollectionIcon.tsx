const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} fill="none">
    <path
      stroke={color}
      strokeWidth={1.562}
      d="M3.5 4.75V2.515C3.5 1.678 4.178 1 5.015 1h9.47C15.322 1 16 1.678 16 2.515v4.688c0 .837-.678 1.515-1.515 1.515h-.959"
    />
    <path
      stroke={color}
      strokeWidth={1.562}
      d="M1 6.269c0-.837.678-1.515 1.515-1.515h9.492c.836 0 1.515.678 1.515 1.515v4.701c0 .837-.679 1.515-1.515 1.515h-1.803v2.384a.505.505 0 0 1-.842.376l-3.078-2.76H2.515A1.515 1.515 0 0 1 1 10.97V6.27Z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgComponent;
