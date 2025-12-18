import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton } from '@mui/material';
import { ContentItem } from '../FormBuilder.types';
import styles from './ContentItemComponent.module.css';
import { MediaContent } from './types/MediaContent';
import { SelectionContent } from './types/SelectionContent';
import { TextAnswerContent } from './types/TextAnswerContent';
import { TextContent } from './types/TextContent';

interface ContentItemComponentProps {
  item: ContentItem;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<ContentItem>) => void;
}

export const ContentItemComponent = ({
  item,
  isExpanded,
  onToggleExpanded,
  onDelete,
  onUpdate,
}: ContentItemComponentProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderContentEditor = () => {
    switch (item.type) {
      case 'Text':
        return <TextContent onUpdate={onUpdate} item={item} />;
      case 'Media':
        return <MediaContent data={item.data} onUpdate={onUpdate} type={item.type} />;
      case 'Text Answer':
        return <TextAnswerContent item={item} onUpdate={onUpdate} />;
      case 'Selection':
        return <SelectionContent item={item} onUpdate={onUpdate} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.contentItemContainer} ${isDragging ? styles.dragging : ''} ${
        isExpanded ? styles.expanded : ''
      }`}
    >
      <div className={`${styles.contentHeader} ${isExpanded && styles.expandedHeader}`}>
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          <DragIndicatorIcon fontSize="small" />
        </div>
        <span className={styles.contentTitle}>{item.name}</span>
        <div className={styles.actions}>
          <IconButton size="small" onClick={onDelete} aria-label="Delete content">
            <DeleteOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onToggleExpanded} aria-label="Toggle expand">
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </div>
      </div>

      {isExpanded && <div className={styles.contentBody}>{renderContentEditor()}</div>}
    </div>
  );
};
