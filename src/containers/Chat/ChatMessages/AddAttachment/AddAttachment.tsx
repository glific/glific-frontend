import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { MessageType } from 'containers/Chat/ChatConversations/MessageType/MessageType';
import { MEDIA_MESSAGE_TYPES } from 'common/constants';
import { slicedString, validateMedia } from 'common/utils';
import setLogs from 'config/logs';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import UploadIcon from 'assets/images/icons/Upload.svg?react';
import AlertIcon from 'assets/images/icons/Alert/Red.svg?react';
import { setNotification } from 'common/notification';
import styles from './AddAttachment.module.css';

const options = MEDIA_MESSAGE_TYPES.map((option: string) => ({
  id: option,
  label: <MessageType type={option} color="dark" />,
}));

export interface AddAttachmentPropTypes {
  setAttachment: any;
  setAttachmentURL: any;
  setAttachmentAdded: any;
  setAttachmentType: any;
  attachmentURL: any;
  attachmentType: any;
  uploadPermission: boolean;
}

export const AddAttachment = ({
  setAttachment,
  setAttachmentAdded,
  setAttachmentURL,
  setAttachmentType,
  attachmentURL,
  attachmentType,
  uploadPermission,
}: AddAttachmentPropTypes) => {
  const [errors, setErrors] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<null | string>(null);
  const [verifying, setVerifying] = useState(false);
  const [uploadDisabled] = useState(!uploadPermission);

  const { t } = useTranslation();

  const [uploadMedia] = useMutation(UPLOAD_MEDIA, {
    onCompleted: (data: any) => {
      setAttachmentURL(data.uploadMedia);
      setUploading(false);
    },
    onError: () => {
      setFileName(null);
      setUploading(false);
      setNotification(t('An error occured while uploading the file'), 'warning');
    },
  });

  const validateURL = () => {
    if (attachmentURL && attachmentType) {
      setVerifying(true);
      setErrors(null);

      validateMedia(attachmentURL, attachmentType)
        .then((response: any) => {
          if (!response.data.is_valid) {
            setVerifying(false);
            setErrors(response.data.message);
          } else if (response.data.is_valid) {
            setVerifying(false);
            setAttachmentAdded(true);
            setErrors(null);
          }
        })
        .catch((error) => {
          setLogs(error, 'error');
        });
    }
  };

  useEffect(() => {
    validateURL();
  }, [attachmentURL, attachmentType]);

  const helperText = (
    <div className={styles.HelperText}>
      {t('Please wait for the attachment URL verification')}
      <CircularProgress className={styles.ProgressIcon} />
    </div>
  );
  let timer: any = null;
  const input = {
    component: Input,
    name: 'attachmentURL',
    endAdornment: (
      <div className={styles.CrossIcon}>
        <CrossIcon
          data-testid="crossIcon"
          onClick={() => {
            setAttachmentURL('');
            setAttachmentAdded(false);
            setErrors(null);
            setFileName(null);
          }}
        />
      </div>
    ),
    type: 'text',
    placeholder: t('Attachment URL'),
    helperText: verifying && helperText,
    disabled: fileName !== null,
    inputProp: {
      onBlur: (event: any) => {
        setAttachmentURL(event.target.value);
      },
      onChange: (event: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => setAttachmentURL(event.target.value), 1000);
      },
    },
  };

  let formFieldItems: any = [
    {
      component: Dropdown,
      options,
      name: 'attachmentType',
      placeholder: 'Media type',
      fieldValue: attachmentType,
      fieldChange: (event: any) => {
        setAttachmentType(event?.target.value);
        setErrors(null);
      },
    },
  ];

  formFieldItems = attachmentType !== '' ? [...formFieldItems, input] : formFieldItems;

  const validationSchema = Yup.object().shape({
    attachmentType: Yup.string().required(t('Type is required.')),
    attachmentURL: Yup.string().required(t('URL is required.')),
  });

  const displayWarning = () => {
    if (attachmentType === 'STICKER') {
      return (
        <div className={styles.FormHelperText}>
          <ol>
            <li>{t('Animated stickers are not supported.')}</li>
            <li>{t('Captions along with stickers are not supported.')}</li>
          </ol>
        </div>
      );
    }
    return (
      <div className={styles.FormHelperText}>
        <ol>
          <li>{t('Captions along with audio are not supported.')}</li>
        </ol>
      </div>
    );
  };

  const onSubmitHandle = (itemData: { attachmentURL: any; attachmentType: any }) => {
    setAttachmentType(itemData.attachmentType);
    setAttachmentURL(itemData.attachmentURL);
    setAttachment(false);
  };

  const addAttachment = (event: any) => {
    const media = event.target.files[0];

    if (media) {
      const mediaName = media.name;
      const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
      const shortenedName = slicedString(mediaName, 15);
      setFileName(shortenedName);
      setUploading(true);
      uploadMedia({
        variables: {
          media,
          extension,
        },
      });
    }
  };

  const form = (
    <Formik
      enableReinitialize
      initialValues={{ attachmentURL, attachmentType }}
      validationSchema={validationSchema}
      onSubmit={(itemData) => {
        if (!errors) {
          onSubmitHandle(itemData);
        }
      }}
    >
      {({ submitForm }) => (
        <Form className={styles.Form} data-testid="formLayout" encType="multipart/form-data">
          <DialogBox
            titleAlign="left"
            title={t('Add attachments to message')}
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
              setAttachment(false);

              setAttachmentURL('');
              setAttachmentAdded(false);
            }}
            buttonOk={t('Add')}
            alignButtons="left"
            disableOk={verifying}
          >
            <div className={styles.DialogContent} data-testid="attachmentDialog">
              {formFieldItems.map((field: any) => (
                <div className={styles.AttachmentFieldWrapper} key={field.name}>
                  <Field {...field} key={field.name} validateURL={errors} />
                </div>
              ))}
              <div className={styles.FormError}>{errors}</div>
            </div>
            {attachmentType !== '' && (
              <>
                <div className={styles.UploadContainer}>
                  <label
                    className={`${uploadDisabled ? styles.UploadDisabled : styles.UploadEnabled} ${
                      fileName && attachmentURL ? styles.Uploaded : ''
                    }`}
                    htmlFor="uploadFile"
                  >
                    {!uploadPermission && <AlertIcon className={styles.AlertIcon} />}
                    <span className={styles.UploadFile}>
                      {fileName !== null ? (
                        fileName
                      ) : (
                        <>
                          <UploadIcon className={styles.UploadIcon} /> Upload File
                        </>
                      )}

                      <input
                        type="file"
                        id="uploadFile"
                        data-testid="uploadFile"
                        onClick={(event) => {
                          if (uploadDisabled) {
                            event.preventDefault();
                          }
                        }}
                        onChange={(event) => {
                          addAttachment(event);
                        }}
                      />
                    </span>
                  </label>
                </div>
                {uploading && <div className={styles.WaitUpload}>Please wait for upload</div>}
              </>
            )}
            {!uploadPermission && attachmentType !== '' && (
              <div className={styles.FormHelperText}>
                {t('Please integrate Google Cloud Storage to use the upload')}
              </div>
            )}
            {attachmentType === 'STICKER' || attachmentType === 'AUDIO' ? displayWarning() : null}
          </DialogBox>
        </Form>
      )}
    </Formik>
  );

  return form;
};
