import { ContentItemData } from '../../FormBuilder.types';
import styles from './ContentTypes.module.css';

interface MediaContentProps {
  data: ContentItemData;
  onUpdate: (data: ContentItemData) => void;
  type: string;
}

export const MediaContent = ({ data, onUpdate, type }: MediaContentProps) => {
  // TODO: Implement media content handling logic here
  return <div className={styles.contentTypeContainer}></div>;
};
