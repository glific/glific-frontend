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
import { useState } from 'react';
import { ContentItemComponent } from '../ContentItem/ContentItemComponent';
import { ContentSelector } from '../ContentSelector/ContentSelector';
import { ContentItem, Screen } from '../FormBuilder.types';
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
}: ScreenComponentProps) => {
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);

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
    <div ref={setNodeRef} style={style} className={`${styles.screenContainer} ${isDragging ? styles.dragging : ''}`}>
      <div className={styles.screenHeader}>
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          <DragIndicatorIcon />
        </div>

        <span className={styles.screenTitle}>{screen.name}</span>
        <div className={styles.actions}>
          <button className={styles.deleteButton} onClick={onDelete} aria-label="Delete screen">
            <DeleteOutlined />
          </button>
          <button
            className={styles.expandButton}
            onClick={onToggleExpanded}
            aria-label={isExpanded ? 'Collapse screen' : 'Expand screen'}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.screenContent}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Screen Name</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter Screen name"
                value={screen.name}
                onChange={handleNameChange}
                maxLength={30}
              />
              <span className={styles.charCount}>{screen.name.length}/30</span>
            </div>
          </div>

          {screen.content.length !== 0 && (
            <div className={styles.layoutArea}>
              <DndContext sensors={contentSensors} collisionDetection={closestCenter} onDragEnd={handleContentDragEnd}>
                <SortableContext items={screen.content.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className={styles.contentList}>
                    {screen.content.map((item) => (
                      <ContentItemComponent
                        key={item.id}
                        item={item}
                        isExpanded={expandedContentId === item.id}
                        onToggleExpanded={() => setExpandedContentId(expandedContentId === item.id ? null : item.id)}
                        onDelete={() => onDeleteContent(item.id)}
                        onUpdate={(data) => onUpdateContent(item.id, data)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          <ContentSelector onSelectContent={onAddContent} />

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Button Label</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter button label"
                value={screen.buttonLabel}
                onChange={handleButtonLabelChange}
                maxLength={30}
              />
              <span className={styles.charCount}>{screen.buttonLabel.length}/30</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
