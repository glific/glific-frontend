import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ContentItem, Screen } from '../FormBuilder/FormBuilder.types';
import styles from './Preview.module.css';
import BackgroundPhoneImage from 'assets/images/phone.png';

interface PreviewProps {
  screens?: Screen[];
  currentScreenIndex: number;
}

export const Preview = ({ screens = [], currentScreenIndex }: PreviewProps) => {
  const currentScreen = screens[currentScreenIndex];

  const renderTextContent = (item: ContentItem) => {
    const { name, data } = item;
    const text = data.text || 'Text';

    switch (name) {
      case 'Large Heading':
        return <h1 className={styles.TextHeading}>{text}</h1>;
      case 'Small Heading':
        return <h2 className={styles.TextSubheading}>{text}</h2>;
      case 'Caption':
        return <p className={styles.TextCaption}>{text}</p>;
      case 'Body':
      default:
        return <p className={styles.TextBody}>{text}</p>;
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
          <div className={styles.InputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.Required}>*</span>}
            </label>
            <input type="text" className={styles.TextInput} placeholder={placeholder || label} disabled />
          </div>
        );
      case 'Paragraph':
        return (
          <div className={styles.InputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.Required}>*</span>}
            </label>
            <textarea className={styles.TextArea} placeholder={placeholder || label} rows={4} disabled />
            {placeholder && <p className={styles.HelperText}>{placeholder}</p>}
            <p className={styles.CharCount}>0 / 600</p>
          </div>
        );
      case 'Date Picker':
        return (
          <div className={styles.InputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.Required}>*</span>}
            </label>
            <input type="text" className={styles.TextInput} placeholder={placeholder || label} disabled />
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
          <div className={styles.SelectionGroup}>
            <label className={styles.SelectionLabel}>
              {label}
              {required && <span className={styles.Required}>*</span>}
            </label>
            <div className={styles.OptionsList}>
              {options.map((option) => (
                <div key={option.id} className={styles.RadioOption}>
                  <div className={styles.RadioButton}></div>
                  <span className={styles.OptionText}>{option.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Multiple Choice':
        return (
          <div className={styles.SelectionGroup}>
            <label className={styles.SelectionLabel}>
              {label}
              {required && <span className={styles.Required}>*</span>}
            </label>
            <div className={styles.OptionsList}>
              {options.map((option) => (
                <div key={option.id} className={styles.CheckboxOption}>
                  <div className={styles.Checkbox}></div>
                  <span className={styles.OptionText}>{option.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Dropdown':
        return (
          <div className={styles.InputGroup}>
            <label className={styles.inputLabel}>
              {label}
              {required && <span className={styles.Required}>*</span>}
            </label>
            <div className={styles.DropdownField}>
              <span className={styles.DropdownPlaceholder}>{label} dropdown</span>
              <span className={styles.DropdownArrow}>▶</span>
            </div>
          </div>
        );
      case 'Opt In':
        return (
          <div className={styles.OptInGroup}>
            <div className={styles.OptInOption}>
              <div className={styles.Checkbox}></div>
              <span className={styles.OptionText}>
                {label}
                {required && <span className={styles.Required}>*</span>}
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderMediaContent = (item: ContentItem) => {
    const { data } = item;

    const imageUrl = data.text;

    return (
      <div className={styles.ImageContainer}>
        <img src={imageUrl} alt="Media content" className={styles.MediaImage} />
      </div>
    );
  };

  const renderContent = (item: ContentItem) => {
    switch (item.type) {
      case 'Text':
        return renderTextContent(item);
      case 'Text Answer':
        return renderTextAnswerContent(item);
      case 'Selection':
        return renderSelectionContent(item);
      case 'Media':
        return renderMediaContent(item);
      default:
        return null;
    }
  };

  return (
    <div data-testid="form-preview" className={styles.PreviewContainer}>
      <div className={styles.PhoneFrame}>
        <div className={styles.PhoneScreen}>
          <img alt="phone" src={BackgroundPhoneImage} className={styles.BackgroundImage} draggable="false" />

          {currentScreen && (
            <>
              <div className={styles.ChatContentContainer}>
                <div className={styles.WhatsappHeader}>
                  <CloseIcon className={styles.CloseIcon} />
                  <span data-testid="preview-screen-name" className={styles.ScreenTitle}>
                    {currentScreen.name || 'Screen'}
                  </span>
                  <MoreVertIcon className={styles.MenuIcon} />
                </div>
                <div className={styles.FormCard}>
                  <div className={styles.FormContent}>
                    {currentScreen.content.map((item) => (
                      <div key={item.id} className={styles.ContentItem}>
                        {renderContent(item)}
                      </div>
                    ))}
                  </div>
                  {currentScreen.buttonLabel && (
                    <div className={styles.FormFooter}>
                      <button data-testid="preview-button-label" className={styles.ContinueButton}>
                        {currentScreen.buttonLabel}
                      </button>
                      <p className={styles.FooterText}>Managed by the business. Learn more</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {!currentScreen && (
            <div className={styles.EmptyState}>
              <p>No screens to preview. Add a screen to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
