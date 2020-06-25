import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Pager } from '../../../components/UI/Pager/Pager';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { GET_LANGUAGES_QUERY } from '../../../graphql/queries/Language';

export interface LanguageListProps {}

export const LanguageList: React.SFC<LanguageListProps> = (props) => {
  const columnNames = ['Language Name', 'Operations'];
  const { loading, error, data, refetch } = useQuery(GET_LANGUAGES_QUERY);

  // Loading + error cases
  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  if (data) {
    console.log(data);
  }
  return (
    <div>
      <h1>Language List</h1>
      {/* {languageList ? (
        <Pager
          columnNames={columnNames}
          data={tagList}
          totalRows={tagCount}
          handleTableChange={handleTableChange}
          tableVals={tableVals}
        />
      ) : (
        <div>There are no tags.</div>
      )} */}
    </div>
  );
};
