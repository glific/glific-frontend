const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none">
    <path
      fill={color}
      d="M5.4 12.6h10.8V1.8h-1.8v6.3l-2.25-1.35L9.9 8.1V1.8H5.4v10.8Zm0 1.8c-.495 0-.919-.176-1.271-.529A1.733 1.733 0 0 1 3.6 12.6V1.8c0-.495.176-.919.529-1.271A1.733 1.733 0 0 1 5.4 0h10.8c.495 0 .919.176 1.271.529.353.352.529.776.529 1.271v10.8c0 .495-.176.919-.529 1.271a1.734 1.734 0 0 1-1.271.529H5.4ZM1.8 18c-.495 0-.919-.176-1.271-.529A1.734 1.734 0 0 1 0 16.2V3.6h1.8v12.6h12.6V18H1.8Z"
    />
  </svg>
);
export default SvgComponent;
