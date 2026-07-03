import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { setErrorMessage, setNotification } from 'common/notification';
import { getUserRole } from 'context/role';
import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WaGroups';
import { SET_PRIMARY_PHONE_FOR_COLLECTION } from 'graphql/mutations/Group';
import { toActivePhoneOptions } from 'containers/WaGroups/managedPhones';

export interface SetCollectionPrimaryPhoneProps {
  collectionId: string;
}

/**
 * Admin action on a WhatsApp-group collection: pick one managed phone and make it
 * the primary across every group in the collection in one bulk call. The backend
 * runs it in the background and reports skipped groups via a notification.
 */
export const SetCollectionPrimaryPhone = ({ collectionId }: SetCollectionPrimaryPhoneProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<{ id: string; label: string } | null>(null);

  // Only Admin / Glific_admin can drive the collection-wide primary phone.
  const roles = getUserRole();
  const isAdmin = roles.includes('Admin') || roles.includes('Glific_admin');

  const { data } = useQuery(GET_WA_MANAGED_PHONES, {
    variables: { filter: {} },
    skip: !isAdmin || !open,
  });

  const phoneOptions = toActivePhoneOptions(data?.waManagedPhones);

  const [setPrimaryForCollection, { loading }] = useMutation(SET_PRIMARY_PHONE_FOR_COLLECTION);

  const handleClose = () => {
    setOpen(false);
    setSelectedPhone(null);
  };

  const handleConfirm = async () => {
    if (!selectedPhone) return;
    try {
      const { data: response } = await setPrimaryForCollection({
        variables: { collectionId, waManagedPhoneId: selectedPhone.id },
      });

      const result = response?.setPrimaryPhoneForCollection;
      const errors = result?.errors;
      if (errors?.length) {
        setNotification(
          errors
            .map((error: { message?: string }) => error?.message)
            .filter(Boolean)
            .join('; '),
          'warning'
        );
        return;
      }

      setNotification(
        result?.status || t('Setting the primary phone across the collection has started in the background.'),
        'success'
      );
      handleClose();
    } catch (error) {
      setErrorMessage(error as Error);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Button variant="outlined" color="primary" data-testid="setCollectionPrimaryBtn" onClick={() => setOpen(true)}>
        {t('Set primary phone')}
      </Button>

      {open && (
        <DialogBox
          title={t('Set primary phone for the collection')}
          handleOk={handleConfirm}
          handleCancel={handleClose}
          buttonOk={t('Apply')}
          buttonOkLoading={loading}
          disableOk={!selectedPhone || loading}
          skipCancel={loading}
          alignButtons="center"
        >
          <div data-testid="setCollectionPrimaryDialog">
            <p>
              {t(
                'This phone becomes the primary for every WhatsApp group in the collection where it is an active member. Groups where it is not a member are skipped and reported.'
              )}
            </p>
            <AutoComplete
              options={phoneOptions}
              optionLabel="label"
              multiple={false}
              placeholder={t('Select a phone')}
              onChange={(value: any) => setSelectedPhone(value || null)}
              form={{ setFieldValue: () => {} }}
              field={{ name: 'primaryPhone', value: selectedPhone }}
            />
          </div>
        </DialogBox>
      )}
    </>
  );
};

export default SetCollectionPrimaryPhone;
