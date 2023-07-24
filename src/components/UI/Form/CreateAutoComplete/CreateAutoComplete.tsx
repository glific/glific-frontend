import { useMutation } from '@apollo/client';
import { AutoComplete, AutocompleteProps } from '../AutoComplete/AutoComplete';
import { CREATE_LABEL } from 'graphql/mutations/Tags';

export interface CreateAutoCompleteProp extends AutocompleteProps {}

export const CreateAutoComplete = ({ ...rest }: CreateAutoCompleteProp) => {
  const [createTag] = useMutation(CREATE_LABEL);

  const handleCreateItem = async (value: string) => {
    return createTag({
      variables: {
        input: {
          label: value,
          languageId: '1',
        },
      },
    }).then((value) => value.data.createTag.tag);
  };

  return <AutoComplete {...rest} handleCreateItem={handleCreateItem} />;
};
