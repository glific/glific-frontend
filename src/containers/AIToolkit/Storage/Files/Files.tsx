interface FilesProps {
  files: { id: string; file_name: string; inserted_at: string }[];
}

export const FilesAttached = ({ files }: FilesProps) => {
  return <div></div>;
};
