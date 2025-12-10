import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Screen } from '../FormBuilder.types';
import styles from './Screen.module.css';

export interface ScreenComponentProps {
  screen: Screen;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDelete: () => void;
  onUpdateName: (name: string) => void;
  onUpdateButtonLabel: (label: string) => void;
  onAddContent: () => void;
}

export const ScreenComponent = ({
  screen,
  isExpanded,
  onToggleExpanded,
  onDelete,
  onUpdateName,
  onUpdateButtonLabel,
  onAddContent,
}: ScreenComponentProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: screen.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 30) {
      onUpdateName(e.target.value);
    }
  };

  const handleButtonLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 30) {
      onUpdateButtonLabel(e.target.value);
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

          <button className={styles.addContentButton} onClick={onAddContent}>
            + Add Content
          </button>

          <div className={styles.layoutArea}>
            {screen.content.length === 0 ? (
              <div className={styles.emptyContent}>
                <p>No content added yet. Click "Add Content" to get started.</p>
              </div>
            ) : (
              <div className={styles.contentList}>
                {screen.content.map((item) => (
                  <div key={item.id} className={styles.contentItem}>
                    <span className={styles.contentType}>{item.type}</span>
                    <span className={styles.contentValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
