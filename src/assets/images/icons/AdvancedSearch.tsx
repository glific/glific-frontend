export const AdvancedSearchIcon = ({ isActive = false }: { isActive: boolean }) => {
  const color = isActive ? '#119656' : '';
  return (
    <svg
      data-testid="advanced-search-icon"
      className="w-[16px] h-[16px] text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill={color || 'none'}
      stroke={color ? 'none' : '#d9d9d9'}
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z" />
    </svg>
  );
};

export default AdvancedSearchIcon;
