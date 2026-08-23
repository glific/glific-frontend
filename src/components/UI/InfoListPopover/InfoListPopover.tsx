import { MouseEvent, ReactNode, useState } from 'react';
import { Popover } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';

import { Button } from 'components/UI/Form/Button/Button';
import styles from './InfoListPopover.module.css';

export interface InfoListEntry {
  title: ReactNode;
  description?: ReactNode;
  linkLabel?: string;
  linkUrl?: string;
}

export interface InfoListPopoverProps {
  /** One block per thing you want to explain. */
  entries: InfoListEntry[];
  /** Visible text on the trigger, and its accessible name. */
  triggerLabel: string;
  heading?: ReactNode;
  /** Shown instead of the list when `entries` is empty. */
  emptyText?: ReactNode;
  className?: string;
  testId?: string;
}

/**
 * Trigger button that opens a popover listing several explanations, each with its own
 * optional "learn more" link.
 *
 * Use `HelpIcon` instead when there is a single sentence and at most one link — this is for
 * the case `HelpIcon` cannot express: a list where every entry carries its own link.
 */
export const InfoListPopover = ({
  entries,
  triggerLabel,
  heading,
  emptyText,
  className,
  testId = 'info-list-popover',
}: InfoListPopoverProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        variant="text"
        className={`${styles.Trigger} ${className ?? ''}`}
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid={testId}
      >
        <InfoOutlinedIcon className={styles.TriggerIcon} />
        {triggerLabel}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { className: styles.PanelPaper } }}
      >
        <div className={styles.Panel} data-testid={`${testId}-panel`}>
          {heading && <div className={styles.Heading}>{heading}</div>}

          {entries.length === 0 ? (
            <p className={styles.Empty}>{emptyText || t('No details available.')}</p>
          ) : (
            <ul className={styles.List}>
              {entries.map((entry, index) => (
                <li className={styles.Entry} key={index} data-testid={`${testId}-entry`}>
                  <p className={styles.EntryTitle}>{entry.title}</p>
                  {entry.description && <p className={styles.EntryDescription}>{entry.description}</p>}
                  {entry.linkUrl && (
                    <a className={styles.EntryLink} href={entry.linkUrl} target="_blank" rel="noopener noreferrer">
                      {entry.linkLabel || t('Learn more')}
                      <OpenInNewIcon className={styles.EntryLinkIcon} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Popover>
    </>
  );
};

export default InfoListPopover;
