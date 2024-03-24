const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none">
    <path
      fill={color}
      d="M2 18c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 0 1 0 16V2C0 1.45.196.98.588.587A1.926 1.926 0 0 1 2 0h7v2H2v14h7v2H2Zm11-4-1.375-1.45 2.55-2.55H6V8h8.175l-2.55-2.55L13 4l5 5-5 5Z"
    />
  </svg>
);
export default SvgComponent;
