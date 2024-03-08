const SvgComponent = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={15} height={17} fill="none">
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.787}
      d="M7.5 7.666c1.795 0 3.25-1.492 3.25-3.333C10.75 2.493 9.295 1 7.5 1S4.25 2.492 4.25 4.333c0 1.841 1.455 3.333 3.25 3.333ZM10.75 11h-6.5C2.455 11 1 12.492 1 14.333V16h13v-1.667C14 12.493 12.545 11 10.75 11Z"
    />
  </svg>
);
export default SvgComponent;
