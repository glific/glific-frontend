import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import { IconButton, InputBase, Typography, Divider } from '@material-ui/core';
import { Redirect, Link } from 'react-router-dom';
import { Pager } from '../../../components/UI/Pager/Pager';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { GET_LANGUAGES_COUNT, GET_LANGUAGES_QUERY } from '../../../graphql/queries/Language';

export interface LanguageListProps {}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const LanguageList: React.SFC<LanguageListProps> = (props) => {
  const columnNames = ['Language Name', 'Operations'];
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 10,
    sortCol: columnNames[0],
    sortDirection: 'asc',
  });

  const { loading, error, data, refetch } = useQuery(GET_LANGUAGES_QUERY);
  const {
    loading: loadingCount,
    error: errorCount,
    data: dataCount,
    refetch: refetchCount,
  } = useQuery(GET_LANGUAGES_COUNT);

  // Loading + error cases
  if (loading || loadingCount) return <Loading />;
  if (error || errorCount) return <p>Error :(</p>;
  if (data === undefined || data.languages === undefined) {
    return null;
  }

  if (dataCount === undefined || dataCount.countLanguages === undefined) {
    return null;
  }

  const handleTableChange = () => {
    console.log('tabled changed!');
  };

  // const editLanguages = (languageObj: any) => {
  //   setLanguageList(languageList.filter((langObj) => langObj.label === languageObj.label));
  // };

  const getIcons = (languageObj: any) => {
    if (languageObj) {
      return (
        <>
          <IconButton
            aria-label="Edit"
            color="default"
            onClick={() => {
              console.log(languageObj);
              console.log('edit');
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton arial-label="DELETE" color="default" onClick={() => console.log('delete')}>
            <DeleteIcon />
          </IconButton>
        </>
      );
    }
  };

  const formatLanguages = (languages: Array<any>) => {
    // Should be type tag, but can't import Tag type into file
    return languages.map((language: any) => {
      return {
        label: language.label,
        operations: getIcons(language),
      };
    });
  };

  // Get language list and count of languages
  let languageList: any; // Can't use state here temporarily, need to make the different request in order to work properly.
  if (data) {
    languageList = formatLanguages(data.languages);
  }

  let languageCount: number = 0;
  if (dataCount) {
    languageCount = dataCount.countLanguages;
  }

  console.log(languageList);

  return (
    <div>
      <h1>Language List</h1>
      {languageList ? (
        <Pager
          columnNames={columnNames}
          data={languageList}
          totalRows={languageCount}
          handleTableChange={handleTableChange}
          tableVals={tableVals}
        />
      ) : (
        <div>There are no languages.</div>
      )}
    </div>
  );
};
