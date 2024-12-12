import Button from '@mui/material/Button';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import styles from './UploadFile.module.css';
import { slicedString } from 'common/utils';
import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CATEGORIES } from 'graphql/queries/KnowledgeBase';
import { CircularProgress } from '@mui/material';
import { CREATE_CATEGORY } from 'graphql/mutations/KnowledgeBase';
import { AutoComplete } from '../../../components/UI/Form/AutoComplete/AutoComplete';

interface UploadFileProps {
  setFile: any;
  category: string | null;
  setCategory: any;
  file: any;
}

export const UploadFile = ({ setFile, setCategory }: UploadFileProps) => {
  const [errors, setErrors] = useState<string>('');
  const [fileName, setFileName] = useState<null | string>(null);
  const [options, setOptions] = useState([]);

  const { loading, refetch: refetchCategories } = useQuery(GET_CATEGORIES, {
    onCompleted: (data) => {
      setOptions(data.categories.map((category: any) => ({ id: category.id, label: category.name })));
    },
  });

  const [createCategory] = useMutation(CREATE_CATEGORY);

  const handleCreateCategory = async (value: string) => {
    return createCategory({
      variables: {
        name: value,
      },
    }).then((value) => {
      refetchCategories();
      setCategory(value.data.createCategory.id);
      return { id: value.data.createCategory.id, label: value.data.createCategory.name };
    });
  };

  let formFieldItems: any = [
    {
      component: AutoComplete,
      name: 'categoryId',
      options: options,
      optionLabel: 'label',
      disabled: false,
      handleCreateItem: handleCreateCategory,
      hasCreateOption: true,
      multiple: false,
      label: 'Category',
      onChange: (value: any) => {
        setCategory(value?.id);
      },
    },
  ];

  const addFile = (event: any) => {
    const media = event.target.files[0];
    if (media) {
      if (media.size / 1000000 > 20) {
        setErrors('File size should be less than 20MB');
        return;
      } else if (media.type !== 'application/pdf') {
        setErrors('File type should be PDF');
        return;
      }

      const mediaName = media.name;
      const slicedName = slicedString(mediaName, 25);
      setFileName(slicedName);
      setFile(media);
    }
  };

  if (loading) {
    return <CircularProgress data-testid="loading" className={styles.Loading} />;
  }

  return (
    <Formik
      initialValues={{
        file: '',
        categoryId: '',
      }}
      onSubmit={() => {}}
    >
      <Form className={styles.Form} data-testid="formLayout" encType="multipart/form-data">
        <div className={styles.DialogContent} data-testid="">
          {formFieldItems.map((field: any) => (
            <div className={styles.Wrapper} key={field.name}>
              <div className={styles.FormField}>{field.label}</div>
              <Field {...field} key={field.name} validateURL={errors} />
            </div>
          ))}
        </div>
        <div className={styles.Wrapper}>
          <div className={styles.FormField}>Document</div>
          <Button
            className="Container"
            fullWidth={true}
            component="label"
            role={undefined}
            variant="text"
            tabIndex={-1}
          >
            <div className={styles.Container}>
              {fileName !== null ? (
                <span className={styles.FileName}>{fileName}</span>
              ) : (
                <div>
                  <UploadIcon className={styles.UploadIcon} />
                  <span>Upload File</span>
                </div>
              )}
              <input
                type="file"
                id="uploadFile"
                accept=".pdf"
                data-testid="uploadFile"
                name="file"
                onChange={(event) => {
                  setErrors('');
                  addFile(event);
                }}
              />
            </div>
          </Button>
          <p data-testid="form-error" className={styles.FormError}>
            {errors}
          </p>
          <p className={styles.HelperText}>
            Please upload a single page PDF. <br />
            Size should not exceed 20MB.
          </p>
        </div>
      </Form>
    </Formik>
  );
};
