const AIEvalsIcon = ({ color }: { color: string }) => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="15" height="15" rx="2" stroke={color} strokeWidth="1.4" />
    <path d="M4 5.5H7.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M4 8.5H9.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M4 11.5H7" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M10.5 9.5L12 11L14.5 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default AIEvalsIcon;
