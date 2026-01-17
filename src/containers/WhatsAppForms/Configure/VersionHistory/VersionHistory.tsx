import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { List, ListItem, ListItemText, ListItemButton, Button, Typography, CircularProgress, Box } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { LIST_WHATSAPP_FORM_REVISIONS } from 'graphql/queries/WhatsAppForm';
import { REVERT_TO_WHATSAPP_FORM_REVISION } from 'graphql/mutations/WhatsAppForm';
import { setNotification } from 'common/notification';
import setLogs from 'config/logs';
import styles from './VersionHistory.module.css';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

interface VersionHistoryProps {
  whatsappFormId: string;
  onRevisionReverted: (data: any) => void;
}

interface Revision {
  id: string;
  revisionNumber: number;
  insertedAt: string;
  updatedAt: string;
  definition: string;
}

export const VersionHistory = ({ whatsappFormId, onRevisionReverted }: VersionHistoryProps) => {
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [showRevertDialog, setShowRevertDialog] = useState(false);

  const { data, loading } = useQuery(LIST_WHATSAPP_FORM_REVISIONS, {
    variables: { whatsappFormId, limit: 10 },
    skip: !whatsappFormId,
  });

  const [revertToRevision, { loading: reverting }] = useMutation(REVERT_TO_WHATSAPP_FORM_REVISION, {
    onCompleted: (data) => {
      setNotification('Successfully reverted to selected version', 'success');
      setShowRevertDialog(false);
      setSelectedRevision(null);
      onRevisionReverted(data);
    },
    onError: (error) => {
      setNotification('Error reverting to version', 'warning');
      setLogs(error, 'error');
    },
  });

  const handleRevertClick = (revision: Revision) => {
    setSelectedRevision(revision);
    setShowRevertDialog(true);
  };

  const handleConfirmRevert = () => {
    if (selectedRevision) {
      revertToRevision({
        variables: {
          whatsappFormId,
          revisionId: selectedRevision.id,
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const revisions: Revision[] = data?.listWhatsappFormRevisions || [];

  if (loading) {
    return (
      <Box className={styles.LoadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={styles.VersionHistoryContainer}>
      <Typography variant="h6" className={styles.Title}>
        Version History
      </Typography>
      <Typography variant="body2" className={styles.Subtitle}>
        Last 10 revisions
      </Typography>

      {revisions.length === 0 ? (
        <Box className={styles.EmptyState}>
          <Typography variant="body2" color="text.secondary">
            No revision history available
          </Typography>
        </Box>
      ) : (
        <List className={styles.RevisionList}>
          {revisions.map((revision, index) => (
            <ListItem
              key={revision.id}
              disablePadding
              secondaryAction={
                index !== 0 && (
                  <Button
                    size="small"
                    startIcon={<RestoreIcon />}
                    onClick={() => handleRevertClick(revision)}
                    className={styles.RevertButton}
                  >
                    Revert
                  </Button>
                )
              }
            >
              <ListItemButton className={styles.RevisionItem}>
                <ListItemText
                  primary={
                    <Box className={styles.RevisionHeader}>
                      <Typography variant="body1" fontWeight={index === 0 ? 600 : 400}>
                        Version {revision.revisionNumber}
                        {index === 0 && <span className={styles.CurrentBadge}>Current</span>}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(revision.insertedAt)}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {showRevertDialog && (
        <DialogBox
          open={showRevertDialog}
          title="Are you sure you want to revert?"
          buttonOk="Revert"
          buttonCancel="Cancel"
          handleCancel={() => setShowRevertDialog(false)}
          buttonOkLoading={reverting}
          handleOk={handleConfirmRevert}
        >
          <div>
            <p>Revert to Version {selectedRevision?.revisionNumber}?</p>
            <span>Created: {selectedRevision && formatDate(selectedRevision.insertedAt)}</span>
          </div>
        </DialogBox>
      )}
    </div>
  );
};
