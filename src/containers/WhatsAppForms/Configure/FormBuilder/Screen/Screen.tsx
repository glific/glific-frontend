import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import { ContentItemComponent } from '../ContentItem/ContentItemComponent';
import { ContentSelector } from '../ContentSelector/ContentSelector';
import { ContentItem, Screen } from '../FormBuilder.types';
import { hasScreenError } from '../FormBuilder.utils';
import styles from './Screen.module.css';

export interface ScreenComponentProps {
  screen: Screen;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDelete: () => void;
  onUpdateName: (name: string) => void;
  onUpdateButtonLabel: (label: string) => void;
  onAddContent: (category: string, item: string) => void;
  onUpdateContent: (contentId: string, updates: Partial<ContentItem>) => void;
  onDeleteContent: (contentId: string) => void;
  onReorderContent: (oldIndex: number, newIndex: number) => void;
  expandedContentId: string | null;
  setExpandedContentId: (id: string | null) => void;
  isViewOnly?: boolean;
}

export const ScreenComponent = ({
  screen,
  isExpanded,
  onToggleExpanded,
  onDelete,
  onUpdateName,
  onUpdateButtonLabel,
  onAddContent,
  onUpdateContent,
  onDeleteContent,
  onReorderContent,
  expandedContentId,
  setExpandedContentId,
  isViewOnly = false,
}: ScreenComponentProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: screen.id });

  const contentSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasNameError = !screen.name || screen.name.trim() === '';
  const hasButtonLabelError = !screen.buttonLabel || screen.buttonLabel.trim() === '';

  const handleNameChange = (e: any) => {
    if (e.target.value.length <= 30) {
      onUpdateName(e.target.value);
    }
  };

  const handleButtonLabelChange = (e: any) => {
    if (e.target.value.length <= 30) {
      onUpdateButtonLabel(e.target.value);
    }
  };

  const handleContentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = screen.content.findIndex((item) => item.id === active.id);
      const newIndex = screen.content.findIndex((item) => item.id === over.id);
      onReorderContent(oldIndex, newIndex);
    }
  };

  return (
    <div
      data-testid="form-screen"
      ref={setNodeRef}
      style={style}
      className={`${styles.ScreenContainer} ${isDragging ? styles.Dragging : ''}`}
    >
      <div className={styles.ScreenHeader}>
        {!isViewOnly && (
          <div className={styles.DragHandle} {...attributes} {...listeners}>
            <DragIndicatorIcon />
          </div>
        )}

        <span className={styles.ScreenTitle}>{screen.name}</span>
        {hasScreenError(screen) && <WarningIcon fontSize="small" style={{ color: '#f44336', marginLeft: 'auto' }} />}
        <div className={styles.Actions}>
          {!isViewOnly && (
            <button
              className={styles.DeleteButton}
              onClick={onDelete}
              aria-label="Delete screen"
              data-testid="delete-screen"
            >
              <DeleteOutlined />
            </button>
          )}
          <button
            className={styles.ExpandButton}
            onClick={onToggleExpanded}
            aria-label={isExpanded ? 'Collapse screen' : 'Expand screen'}
            data-testid="toggle-screen-expand"
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.ScreenContent}>
          <div className={styles.Field}>
            <label className={styles.FieldLabel}>Screen Name</label>
            <div className={styles.InputWrapper}>
              <input
                data-testid="screen-name-input"
                type="text"
                className={`${styles.Input} ${hasNameError ? styles.Error : ''}`}
                placeholder="Enter Screen name"
                value={screen.name}
                onChange={handleNameChange}
                maxLength={30}
                readOnly={isViewOnly}
              />
              {!isViewOnly && <span className={styles.CharCount}>{screen.name.length}/30</span>}
            </div>
            {hasNameError && !isViewOnly && <div className={styles.ErrorMessage}>Screen name is required</div>}
          </div>

          {screen.content.length !== 0 && (
            <div className={styles.LayoutArea}>
              <DndContext
                sensors={isViewOnly ? [] : contentSensors}
                collisionDetection={closestCenter}
                onDragEnd={isViewOnly ? undefined : handleContentDragEnd}
              >
                <SortableContext items={screen.content.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className={styles.ContentList}>
                    {screen.content.map((item) => (
                      <ContentItemComponent
                        key={item.id}
                        item={item}
                        isExpanded={expandedContentId === item.id}
                        onToggleExpanded={() => setExpandedContentId(expandedContentId === item.id ? null : item.id)}
                        onDelete={() => onDeleteContent(item.id)}
                        onUpdate={(data) => onUpdateContent(item.id, data)}
                        isViewOnly={isViewOnly}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {!isViewOnly && <ContentSelector onSelectContent={onAddContent} />}

          <div className={styles.Field}>
            <label className={styles.FieldLabel}>Button Label</label>
            <div className={styles.InputWrapper}>
              <input
                type="text"
                className={`${styles.Input} ${hasButtonLabelError ? styles.Error : ''}`}
                placeholder="Enter button label"
                value={screen.buttonLabel}
                onChange={handleButtonLabelChange}
                maxLength={30}
                readOnly={isViewOnly}
                data-testid="button-label-input"
              />
              {!isViewOnly && <span className={styles.CharCount}>{screen.buttonLabel.length}/30</span>}
            </div>
            {hasButtonLabelError && !isViewOnly && <div className={styles.ErrorMessage}>Button label is required</div>}
          </div>
        </div>
      )}
    </div>
  );
};
