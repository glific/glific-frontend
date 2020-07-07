import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification } from '../../../common/notification';
import { IconButton, Typography, Button as MaterialButton } from '@material-ui/core';
import { Button } from '../../../components/UI/Form/Button/Button';
import { Loading } from '../../../components/UI/Layout/Loading/Loading';
import { Pager } from '../../../components/UI/Pager/Pager';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import styles from './MessageTemplateList.module.css';
import { SearchBar } from '../../Chat/ChatConversations/SearchBar';
import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/icons/Edit.svg';
import { ReactComponent as SpeedSendIcon } from '../../../assets/images/icons/SpeedSend/Selected.svg';

export interface TemplateListProps {}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const MessageTemplateList: React.SFC<TemplateListProps> = (props) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteTemplateID, setDeleteTemplateID] = useState<number | null>(null);
  const [deleteTemplateName, setDeleteTemplateName] = useState<string>('');

  const [newTemplate, setNewTemplate] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Table attributes
  const columnNames = ['Label', 'Body', 'Actions'];
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 10,
    sortCol: columnNames[0],
    sortDirection: 'asc',
  });

  const handleTableChange = (attribute: string, newVal: number | string) => {
    // To handle sorting by columns that are not Name (currently don't support this functionality)
    if (attribute === 'sortCol' && newVal !== 'Label') {
      return;
    }
    // Otherwise, set all values like normal
    setTableVals({
      ...tableVals,
      [attribute]: newVal,
    });
  };

  const filterPayload = () => {
    return {
      filter: {
        label: searchVal,
      },
      opts: {
        limit: tableVals.pageRows,
        offset: tableVals.pageNum * tableVals.pageRows,
        order: tableVals.sortDirection.toUpperCase(),
      },
    };
  };

  // Get the total number of Templates here
  const { loading: l, error: e, data: countData, refetch: refetchCount } = useQuery(
    GET_TEMPLATES_COUNT,
    {
      variables: {
        filter: {
          label: '',
        },
      },
    }
  );

  // Get TEMPLATE data here
  const { loading, error, data, refetch } = useQuery(FILTER_TEMPLATES, {
    variables: filterPayload(),
  });

  const message = useQuery(NOTIFICATION);

  useEffect(() => {
    refetch(filterPayload());
  }, [refetch]);

  // Make a new count request for a new count of the # of rows from this query in the back-end.
  useEffect(() => {
    refetchCount({
      filter: {
        label: searchVal,
      },
    });
  }, [searchVal, refetchCount]);

  let deleteId: number = 0;

  const [deleteTemplate] = useMutation(DELETE_TEMPLATE, {
    update(cache) {
      const templates: any = cache.readQuery({
        query: FILTER_TEMPLATES,
        variables: filterPayload(),
      });
      const templatesCopy = JSON.parse(JSON.stringify(templates));
      templatesCopy.sessionTemplates = templates.sessionTemplates.filter(
        (val: any) => val.id !== deleteId
      );
      cache.writeQuery({
        query: FILTER_TEMPLATES,
        variables: filterPayload(),
        data: templatesCopy,
      });
    },
  });

  const showDialogHandler = (id: any, label: string) => {
    setDeleteTemplateName(label);
    setDeleteTemplateID(id);
  };
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const closeDialogBox = () => {
    setDeleteTemplateID(null);
  };

  const handleDeleteTemplate = () => {
    if (deleteTemplateID !== null) {
      deleteHandler(deleteTemplateID);
    }
    setDeleteTemplateID(null);
  };

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  let dialogBox;
  if (deleteTemplateID) {
    dialogBox = (
      <DialogBox
        title={`Are you sure you want to delete the speed send "${deleteTemplateName}"?`}
        handleOk={handleDeleteTemplate}
        handleCancel={closeDialogBox}
        colorOk="secondary"
      >
        It will stop showing now when you are drafting a customized message.
      </DialogBox>
    );
  }

  if (newTemplate) {
    return <Redirect to="/speed-send/add" />;
  }

  if (loading || l) return <Loading />;
  if (error || e) {
    return <p>Error :(</p>;
  }

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTemplate({ variables: { id } });
    setNotification(client, 'Speed send deleted successfully');
  };

  // Reformat all tags to be entered in table
  function getIcons(id: number | undefined, label: string) {
    if (id) {
      return (
        <div className={styles.Icons}>
          <Link to={'/speed-send/' + id + '/edit'}>
            <IconButton aria-label="Edit" color="default">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            aria-label="Delete"
            color="default"
            onClick={() => showDialogHandler(id!, label)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      );
    }
  }

  const getLabel = (label: string) => {
    return <div className={styles.Label}>{label}</div>;
  };

  const getBody = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  function formatTemplates(templates: Array<any>) {
    // Should be type template, but can't import template type into file
    return templates.map((tag: any) => {
      return {
        label: getLabel(tag.label),
        body: getBody(tag.body),
        operations: getIcons(tag.id, tag.label),
      };
    });
  }

  const resetTableVals = () => {
    setTableVals({
      pageNum: 0,
      pageRows: 10,
      sortCol: columnNames[0],
      sortDirection: 'asc',
    });
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.searchInput.value.trim();
    setSearchVal(searchVal);
    resetTableVals();
  };

  // Get template data and total number of templates.
  let templateList: any;
  if (data) {
    templateList = formatTemplates(data.sessionTemplates);
  }

  let templateCount: number = tableVals.pageRows;
  if (countData) {
    templateCount = countData.countSessionTemplates;
  }

  return (
    <>
      <div className={styles.Header}>
        <Typography variant="h5" className={styles.Title}>
          <IconButton disabled={true} className={styles.Icon}>
            <SpeedSendIcon className={styles.SpeedSendIcon} />
          </IconButton>
          Speed sends
        </Typography>
        <div className={styles.Buttons}>
          <SearchBar
            handleSubmit={handleSearch}
            onReset={() => {
              setSearchVal('');
              resetTableVals();
            }}
            searchVal={searchVal}
          />
        </div>
        <div>
          {toastMessage}
          {dialogBox}
          <div className={styles.AddButton}>
            <Button color="primary" variant="contained" onClick={() => setNewTemplate(true)}>
              Add New
            </Button>
            <MaterialButton color="primary" variant="contained" className={styles.DropdownButton}>
              :
            </MaterialButton>
          </div>
        </div>
      </div>

      {/* Rendering list of templates */}
      {templateList ? (
        <Pager
          columnNames={columnNames}
          data={templateList}
          totalRows={templateCount}
          handleTableChange={handleTableChange}
          tableVals={tableVals}
        />
      ) : (
        <div>There are no templates.</div>
      )}
    </>
  );
};
