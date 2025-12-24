import { useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import { Screen, ContentItem } from '../FormBuilder/FormBuilder.types';
import styles from './Preview.module.css';

interface PreviewProps {
  screens?: Screen[];
}

export const Preview = ({ screens = [] }: PreviewProps) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const currentScreen = screens[currentScreenIndex];

  const renderTextContent = (item: ContentItem) => {
    const { name, data } = item;
    const text = data.text || 'Text';

    switch (name) {
      case 'Large Heading':
        return <h1 className={styles.textHeading}>{text}</h1>;
      case 'Small Heading':
        return <h2 className={styles.textSubheading}>{text}</h2>;
      case 'Caption':
        return <p className={styles.textCaption}>{text}</p>;
      case 'Body':
      default:
        return <p className={styles.textBody}>{text}</p>;
    }
  };

  const renderTextAnswerContent = (item: ContentItem) => {
    const { name, data } = item;
    const label = data.label || 'Label';
    const placeholder = data.placeholder || '';
    const required = data.required || false;

    switch (name) {
      case 'Short Answer':
        return (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <input type="text" className={styles.textInput} placeholder={placeholder || label} disabled />
          </div>
        );
      case 'Paragraph':
        return (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <textarea className={styles.textArea} placeholder={placeholder || label} rows={4} disabled />
            {placeholder && <p className={styles.helperText}>{placeholder}</p>}
            <p className={styles.charCount}>0 / 600</p>
          </div>
        );
      case 'Date Picker':
        return (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <input type="text" className={styles.textInput} placeholder={placeholder || label} disabled />
          </div>
        );
      default:
        return null;
    }
  };

  const renderSelectionContent = (item: ContentItem) => {
    const { name, data } = item;
    const label = data.label || 'Label';
    const required = data.required || false;
    const options = data.options || [];

    switch (name) {
      case 'Single Choice':
        return (
          <div className={styles.selectionGroup}>
            <label className={styles.selectionLabel}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.optionsList}>
              {options.map((option) => (
                <div key={option.id} className={styles.radioOption}>
                  <div className={styles.radioButton}></div>
                  <span className={styles.optionText}>{option.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Multiple Choice':
        return (
          <div className={styles.selectionGroup}>
            <label className={styles.selectionLabel}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.optionsList}>
              {options.map((option) => (
                <div key={option.id} className={styles.checkboxOption}>
                  <div className={styles.checkbox}></div>
                  <span className={styles.optionText}>{option.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Dropdown':
        return (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.dropdownField}>
              <span className={styles.dropdownPlaceholder}>{label} dropdown</span>
              <span className={styles.dropdownArrow}>▶</span>
            </div>
          </div>
        );
      case 'Opt In':
        return (
          <div className={styles.optInGroup}>
            <div className={styles.optInOption}>
              <div className={styles.checkbox}></div>
              <span className={styles.optionText}>
                {label}
                {required && <span className={styles.required}>*</span>}
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = (item: ContentItem) => {
    switch (item.type) {
      case 'Text':
        return renderTextContent(item);
      case 'Text Answer':
        return renderTextAnswerContent(item);
      case 'Selection':
        return renderSelectionContent(item);
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentScreenIndex < screens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
    }
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h3>Preview</h3>
        {screens.length > 0 && (
          <div className={styles.screenIndicator}>
            Screen {currentScreenIndex + 1} of {screens.length}
          </div>
        )}
      </div>
      <div className={styles.phoneFrame}>
        <div className={styles.phoneScreen}>
          <div className={styles.chatContent}>
            <div>{currentScreen?.name}</div>

            {currentScreen && (
              <div className={styles.formCard}>
                <div className={styles.formContent}>
                  {currentScreen.content.map((item) => (
                    <div key={item.id} className={styles.contentItem}>
                      {renderContent(item)}
                    </div>
                  ))}
                </div>
                {currentScreen.buttonLabel && (
                  <div className={styles.formFooter}>
                    <button className={styles.continueButton} onClick={handleNext}>
                      {currentScreen.buttonLabel}
                    </button>
                    <p className={styles.footerText}>Managed by the business. Learn more</p>
                  </div>
                )}
              </div>
            )}
            {!currentScreen && (
              <div className={styles.emptyState}>
                <p>No screens to preview. Add a screen to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
