import { Button } from 'components/UI/Form/Button/Button';
import AddIcon from 'assets/images/add.svg?react';
import { useState } from 'react';
import { Input } from 'components/UI/Form/Input/Input';
import styles from './Template.module.css';

export interface TemplateOptionsProps {
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any; setFieldValue: any };
}

export const TemplateVariables = ({ form }: TemplateOptionsProps) => {
  const [variables, setVariables] = useState<any>([{ new: '' }]);
  console.log(form.values);

  const handleAddVariable = () => {
    form.setFieldValue('body', 'dhshd');
  };

  return (
    <div>
      <Button onClick={handleAddVariable} variant="outlined" color="primary">
        <AddIcon />
        Add Variable
      </Button>
      <div>
        <p>Set custom variable values for the message</p>
        {variables.map((variable: any, index: number) => (
          <div className={styles.Variable} key={index}>
            <Input
              field={{ name: 'name', value: '', onBlur: () => {} }}
              label="Name"
              placeholder={'sjshj'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
