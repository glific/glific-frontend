import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_TAG, GET_TAGS } from '../../graphql/queries/Tag';
import { UPDATE_TAG, CREATE_TAG } from '../../graphql/mutations/Tag';
import { DELETE_TAG } from '../../graphql/mutations/Tag';
import { FormLayout } from '../Form/FormLayout';
import { ReactComponent as TagIcon } from '../../assets/images/icons/Tags/Selected.svg';
import styles from './Tag.module.css';
import { AutoComplete } from '../../components/UI/Form/AutoComplete/AutoComplete';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { ColorPicker } from '../../components/UI/ColorPicker/ColorPicker';
import { setVariables } from '../../common/constants';

export interface TagProps {
  match: any;
}

const FormSchema = Yup.object().shape({
  label: Yup.string().required('Title is required.').max(50, 'Title is too long.'),
  description: Yup.string().required('Description is required.'),
});

const dialogMessage = "You won't be able to use this for tagging messages.";

const tagIcon = <TagIcon className={styles.TagIcon} />;

const queries = {
  getItemQuery: GET_TAG,
  createItemQuery: CREATE_TAG,
  updateItemQuery: UPDATE_TAG,
  deleteItemQuery: DELETE_TAG,
};

export const Tag: React.SFC<TagProps> = ({ match }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [colorCode, setColorcode] = useState('#0C976D');
  const [parentId, setParentId] = useState<any>([]);
  const [filterLabel, setFilterLabel] = useState('');
  const [languageId, setLanguageId] = useState('');

  const states = { label, description, keywords, colorCode, parentId };
  const setStates = ({ label, description, keywords, colorCode, parent }: any) => {
    setLabel(label);
    setDescription(description);
    setKeywords(keywords);
    setColorcode(colorCode);
    if (parent) {
      setParentId(getObject(data.tags, [parent.id])[0]);
    }
  };

  const { data } = useQuery(GET_TAGS, {
    variables: setVariables(),
  });
  const [getTags, { data: dataTag }] = useLazyQuery<any>(GET_TAGS, {
    variables: {
      filter: { label: filterLabel, languageId: parseInt(languageId) },
    },
  });

  useEffect(() => {
    if (filterLabel && languageId) getTags();
  }, [filterLabel, languageId, getTags]);

  if (!data) return <Loading />;

  let tags = [];
  if (data) {
    tags = data.tags;
    // remove the self tag from list
    if (data && match && match.params.id) {
      tags = data.tags.filter((tag: any) => tag.id !== match.params.id);
    }
  }

  const getObject = (arr: any, data: any) => {
    if (arr && data) {
      let result: any = [];
      arr.map((obj: any) => {
        data.map((ID: any) => {
          if (obj.id === ID) result.push(obj);
        });
      });
      return result;
    }
  };

  const validateTitle = (value: any) => {
    if (value) {
      setFilterLabel(value);
      let found = [];
      let error;
      if (dataTag) {
        // need to check exact title
        found = dataTag.tags.filter((search: any) => search.label === value);
        if (match.params.id && found.length > 0) {
          found = found.filter((search: any) => search.id !== match.params.id);
        }
      }
      if (found.length > 0) {
        error = 'Title already exists.';
      }
      return error;
    }
  };

  const getLanguageId = (value: any) => {
    setLanguageId(value);
  };

  const formFields = [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Title',
      validate: validateTitle,
    },
    {
      component: Input,
      name: 'description',
      type: 'text',
      placeholder: 'Description',
      rows: 3,
      textArea: true,
    },
    {
      component: Input,
      name: 'keywords',
      type: 'text',
      placeholder: 'Keywords',
      rows: 3,
      helperText: 'Use commas to separate the keywords',
      textArea: true,
    },
    {
      component: AutoComplete,
      name: 'parentId',
      placeholder: 'Parent tag',
      options: tags,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        label: 'Parent tag',
        variant: 'outlined',
      },
    },
    {
      component: ColorPicker,
      name: 'colorCode',
      colorCode: colorCode,
      helperText: 'Tag color',
    },
  ];

  const setPayload = (payload: any) => {
    if (payload.parentId) {
      payload.parentId = payload.parentId.id;
    }
    return payload;
  };

  return (
    <FormLayout
      {...queries}
      match={match}
      refetchQueries={{ onCreate: GET_TAGS }}
      states={states}
      setStates={setStates}
      setPayload={setPayload}
      validationSchema={FormSchema}
      listItemName="tag"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="tag"
      listItem="tag"
      icon={tagIcon}
      getLanguageId={getLanguageId}
    />
  );
};
