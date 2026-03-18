import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import { IconButton } from '@mui/material';
import { ContentItem } from '../FormBuilder.types';
import { hasContentItemError } from '../FormBuilder.utils';
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
  isViewOnly?: boolean;
}

export const ContentItemComponent = ({
  item,
  isExpanded,
  onToggleExpanded,
  onDelete,
  onUpdate,
  isViewOnly = false,
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
        return <TextContent onUpdate={onUpdate} item={item} isViewOnly={isViewOnly} />;
      case 'Media':
        return <MediaContent data={item.data} onUpdate={onUpdate} type={item.type} isViewOnly={isViewOnly} />;
      case 'Text Answer':
        return <TextAnswerContent item={item} onUpdate={onUpdate} isViewOnly={isViewOnly} />;
      case 'Selection':
        return <SelectionContent item={item} onUpdate={onUpdate} isViewOnly={isViewOnly} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.ContentItemContainer} ${isDragging ? styles.Dragging : ''} ${
        isExpanded ? styles.Expanded : ''
      }`}
      data-testid="content-item"
      data-item-id={item.id}
    >
      <div className={`${styles.ContentHeader} ${isExpanded && styles.ExpandedHeader}`}>
        {!isViewOnly && (
          <div className={styles.DragHandle} {...attributes} {...listeners} data-testid="content-drag-handle">
            <DragIndicatorIcon fontSize="small" />
          </div>
        )}
        <span className={styles.ContentTitle}>{item.name}</span>
        {hasContentItemError(item) && <WarningIcon fontSize="small" style={{ color: '#f44336', marginLeft: 'auto' }} />}
        <div className={styles.Actions}>
          {!isViewOnly && (
            <IconButton size="small" onClick={onDelete} aria-label="Delete content" data-testid="delete-content">
              <DeleteOutlined fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onToggleExpanded}
            aria-label="Toggle expand"
            data-testid="content-toggle-expand"
          >
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </div>
      </div>

      {isExpanded && <div className={styles.ContentBody}>{renderContentEditor()}</div>}
    </div>
  );
};
