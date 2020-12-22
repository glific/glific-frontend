import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';

import styles from './HSM.module.css';
import { ReactComponent as TemplateIcon } from '../../../../assets/images/icons/Template/Selected.svg';
import Template from '../Template';
import { AutoComplete } from '../../../../components/UI/Form/AutoComplete/AutoComplete';
import { Input } from '../../../../components/UI/Form/Input/Input';
import { EmojiInput } from '../../../../components/UI/Form/EmojiInput/EmojiInput';
import { GET_HSM_CATEGORIES } from '../../../../graphql/queries/Template';
import { Checkbox } from '../../../../components/UI/Form/Checkbox/Checkbox';

export interface HSMProps {
  match: any;
}

const defaultAttribute = {
  isHsm: true,
};

const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

export const HSM: React.SFC<HSMProps> = ({ match }) => {
  const [categoryOpns, setCategoryOpn] = useState([]);

  const { data: categoryList } = useQuery(GET_HSM_CATEGORIES);

  useEffect(() => {
    if (categoryList) {
      const categoryOpn: any = [];
      categoryList.whatsappHsmCategories.forEach((categories: any) => {
        categoryOpn.push({ label: categories, id: categories });
      });

      setCategoryOpn(categoryOpn);
    }
  }, [categoryList]);

  const formFields = [
    {
      component: EmojiInput,
      name: 'example',
      placeholder: 'Example',
      rows: 5,
      convertToWhatsApp: true,
      textArea: true,
    },
    {
      component: AutoComplete,
      name: 'category',
      options: categoryOpns,
      optionLabel: 'label',
      multiple: false,
      textFieldProps: {
        variant: 'outlined',
        label: 'Category',
      },
    },
    {
      component: Input,
      name: 'shortcode',
      placeholder: 'Shortcode',
    },
    {
      component: Checkbox,
      name: 'isActive',
      title: (
        <Typography variant="h6" style={{ color: '#073f24' }}>
          Is active?
        </Typography>
      ),
    },
  ];

  return (
    <Template
      match={match}
      listItemName="HSM Template"
      redirectionLink="template"
      icon={templateIcon}
      defaultAttribute={defaultAttribute}
      formField={formFields}
    />
  );
};
