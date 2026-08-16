import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import * as goldenQaUtils from 'containers/AIEvaluation/utils/goldenQa';
import { CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import { GET_GOLDEN_QA, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import Evaluation from './Evaluation';
import ViewGoldenQaSetDialog from './ViewGoldenQaSetDialog';

const listVariables = { filter: {}, opts: { order: 'DESC', orderWith: 'inserted_at' } };

const listMock = (goldenQas: { id: string; name: string; insertedAt: string }[]) => ({
  request: { query: LIST_GOLDEN_QA, variables: listVariables },
  result: { data: { goldenQas } },
});

const oneSet = [{ id: 'g1', name: 'maternal_health_core', insertedAt: '2026-08-10T10:00:00Z' }];

const renderTab = (mocks: any[] = [listMock([])]) =>
  render(
    <MockedProvider mocks={mocks}>
      <Evaluation versionNumber={1} />
    </MockedProvider>
  );

// jsdom has no File.text(), and the dialog reads the file before it can preview anything
const csvFile = (contents: string, name = 'Maternal Health.csv') => {
  const file = new File([contents], name, { type: 'text/csv' });
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(contents) });
  return file;
};

const pickFile = (file: File) => {
  const input = screen.getByTestId('goldenQaFileInput');
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
};

const viewSignedUrlMock = {
  request: { query: GET_GOLDEN_QA, variables: { id: 'g1', includeSignedUrl: true } },
  result: {
    data: {
      goldenQa: {
        goldenQa: {
          id: 'g1',
          name: 'maternal_health_core',
          signedUrl: 'https://files.example/set.csv',
          insertedAt: '',
        },
        errors: null,
      },
    },
  },
};

const openManage = async () => {
  fireEvent.click(await screen.findByTestId('manageSetsButton'));
  return screen.findByTestId('manageGoldenQaSetsDialog');
};

const SAMPLE_CSV = 'question,answer,category\nWhen is the first check-up?,In the first trimester.,ANC\nQ2,A2,Nutrition';

describe('listing sets', () => {
  test('an org with no sets is invited to add one', async () => {
    renderTab();

    expect(await screen.findByTestId('goldenQaEmpty')).toHaveTextContent('Add a Golden Q&A set to evaluate');
    expect(screen.queryByTestId('goldenQaSet')).not.toBeInTheDocument();
  });

  test('with sets present the tab shows the run shell, not the list', async () => {
    renderTab([listMock(oneSet)]);

    expect(await screen.findByTestId('evaluationSubTabs')).toBeInTheDocument();
    expect(screen.getByTestId('noEvaluationsYet')).toHaveTextContent('Version 1');
    expect(screen.queryByTestId('manageGoldenQaSet')).not.toBeInTheDocument();
  });

  test('Manage sets opens the list, and View opens that set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(SAMPLE_CSV) }));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openManage();
    const set = screen.getByTestId('manageGoldenQaSet');
    expect(set).toHaveTextContent('maternal_health_core');

    fireEvent.click(set);

    expect(await screen.findByTestId('viewGoldenQaSetDialog')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByTestId('goldenQaViewRow')).toHaveLength(2);
    });
    vi.unstubAllGlobals();
  });

  test('the view dialog can go back to the list it came from', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(SAMPLE_CSV) }));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openManage();
    fireEvent.click(screen.getByTestId('manageGoldenQaSet'));
    fireEvent.click(await screen.findByTestId('middle-button'));

    expect(await screen.findByTestId('manageGoldenQaSetsDialog')).toBeInTheDocument();
    expect(screen.queryByTestId('viewGoldenQaSetDialog')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  test('the two sub-tabs swap the body', async () => {
    renderTab([listMock(oneSet)]);

    await screen.findByTestId('evaluationSubTabs');
    fireEvent.click(screen.getByRole('radio', { name: 'History' }));

    expect(screen.getByTestId('evaluationHistoryEmpty')).toHaveTextContent('No evaluations yet');
    expect(screen.queryByTestId('noEvaluationsYet')).not.toBeInTheDocument();

    // the button leads back to where a run is started
    fireEvent.click(screen.getByTestId('runFirstEvaluationButton'));
    expect(screen.getByTestId('noEvaluationsYet')).toBeInTheDocument();
  });

  test('running an evaluation is not offered yet', async () => {
    renderTab([listMock(oneSet)]);

    expect(await screen.findByTestId('runEvaluationButton')).toBeDisabled();
  });
});

describe('adding a set', () => {
  // with no sets yet, the blocker offers the upload directly
  const openDialog = async () => {
    fireEvent.click(await screen.findByTestId('addFirstSetButton'));
    return screen.findByTestId('addGoldenQaSetDialog');
  };

  test('a chosen file is parsed and previewed before anything is uploaded', async () => {
    renderTab();
    await openDialog();

    pickFile(csvFile(SAMPLE_CSV));

    const parsed = await screen.findByTestId('goldenQaParsed');
    expect(parsed).toHaveTextContent('2');
    expect(parsed).toHaveTextContent('ANC, Nutrition');
    // the rows themselves belong in the view dialog, not here
    expect(screen.queryByTestId('goldenQaPreviewRow')).not.toBeInTheDocument();
  });

  test('the name is suggested from the filename, in the shape the backend accepts', async () => {
    renderTab();
    await openDialog();

    pickFile(csvFile(SAMPLE_CSV, 'Maternal Health.csv'));

    await waitFor(() => {
      expect(screen.getByTestId('goldenQaNameInput')).toHaveValue('maternal_health');
    });
  });

  test('a file with no questions is refused, and nothing can be added', async () => {
    renderTab();
    await openDialog();

    pickFile(csvFile('question,answer,category\n', 'empty.csv'));

    expect(await screen.findByTestId('goldenQaFileError')).toHaveTextContent('No questions found');
    expect(screen.queryByTestId('goldenQaParsed')).not.toBeInTheDocument();
  });

  test('a name the backend would reject is caught before uploading', async () => {
    renderTab();
    await openDialog();
    pickFile(csvFile(SAMPLE_CSV));
    await screen.findByTestId('goldenQaParsed');

    fireEvent.change(screen.getByTestId('goldenQaNameInput'), { target: { value: 'Maternal Health!' } });
    fireEvent.click(screen.getByTestId('ok-button'));

    expect(await screen.findByTestId('goldenQaNameError')).toHaveTextContent('lowercase letters');
  });

  test('uploading sends the file and the set appears in the list', async () => {
    let sent: any;
    const createMock = {
      request: { query: CREATE_GOLDEN_QA },
      variableMatcher: (variables: any) => {
        sent = variables;
        return true;
      },
      result: {
        data: { createGoldenQa: { goldenQa: { id: 'g1', datasetId: 'd1', name: 'maternal_health' }, errors: null } },
      },
    };
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});

    renderTab([listMock([]), createMock, listMock(oneSet)]);
    await openDialog();
    pickFile(csvFile(SAMPLE_CSV));
    await screen.findByTestId('goldenQaParsed');

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Golden Q&A set added');
    });
    expect(sent.input.name).toBe('maternal_health');
    expect(sent.input.duplication_factor).toBe(1);
    expect(sent.input.file).toBeInstanceOf(File);

    // the list is refetched, so the tab moves on from the blocker
    expect(await screen.findByTestId('evaluationSubTabs')).toBeInTheDocument();
    notificationSpy.mockRestore();
  });

  test('an upload the backend refuses is reported', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const failingCreate = {
      request: { query: CREATE_GOLDEN_QA },
      variableMatcher: () => true,
      result: { data: { createGoldenQa: { goldenQa: null, errors: [{ message: 'Name already taken' }] } } },
    };

    renderTab([listMock([]), failingCreate]);
    await openDialog();
    pickFile(csvFile(SAMPLE_CSV));
    await screen.findByTestId('goldenQaParsed');

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith({ message: 'Name already taken' });
    });
    // the dialog stays open so the name can be corrected
    expect(screen.getByTestId('addGoldenQaSetDialog')).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});

describe('the drop zone', () => {
  // with no sets yet, the blocker offers the upload directly
  const openDialog = async () => {
    fireEvent.click(await screen.findByTestId('addFirstSetButton'));
    return screen.findByTestId('addGoldenQaSetDialog');
  };

  test('a dropped file is read the same as a browsed one', async () => {
    renderTab();
    await openDialog();
    const zone = screen.getByTestId('goldenQaDropZone');

    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [csvFile(SAMPLE_CSV)] } });

    expect(await screen.findByTestId('goldenQaParsed')).toHaveTextContent('ANC, Nutrition');
  });

  test('dragging away again leaves the zone alone', async () => {
    renderTab();
    await openDialog();
    const zone = screen.getByTestId('goldenQaDropZone');

    fireEvent.dragOver(zone);
    fireEvent.dragLeave(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [] } });

    expect(screen.queryByTestId('goldenQaParsed')).not.toBeInTheDocument();
  });

  test('clicking the zone opens the file browser', async () => {
    renderTab();
    await openDialog();
    const click = vi.spyOn(screen.getByTestId('goldenQaFileInput') as HTMLInputElement, 'click');

    fireEvent.click(screen.getByTestId('goldenQaDropZone'));

    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  test('adding with no file says so instead of failing quietly', async () => {
    renderTab();
    await openDialog();

    fireEvent.change(screen.getByTestId('goldenQaNameInput'), { target: { value: 'my_set' } });
    fireEvent.click(screen.getByTestId('ok-button'));

    expect(await screen.findByTestId('goldenQaFileError')).toHaveTextContent('Choose a CSV file');
  });

  test('cancelling closes the dialog', async () => {
    renderTab();
    await openDialog();

    fireEvent.click(screen.getByTestId('cancel-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('addGoldenQaSetDialog')).not.toBeInTheDocument();
    });
  });

  test('an upload that never reaches the server is reported', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const brokenCreate = {
      request: { query: CREATE_GOLDEN_QA },
      variableMatcher: () => true,
      error: new Error('Network down'),
    };
    renderTab([listMock([]), brokenCreate]);
    await openDialog();
    pickFile(csvFile(SAMPLE_CSV));
    await screen.findByTestId('goldenQaParsed');

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });
});

describe('viewing a set', () => {
  const openView = async () => {
    await openManage();
    fireEvent.click(screen.getByTestId('manageGoldenQaSet'));
    return screen.findByTestId('viewGoldenQaSetDialog');
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('the stored file is read back and shown as a table', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(SAMPLE_CSV) }));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openView();

    await waitFor(() => {
      expect(screen.getAllByTestId('goldenQaViewRow')).toHaveLength(2);
    });
    expect(screen.getByTestId('goldenQaViewSummary')).toHaveTextContent('2 questions · showing 2');
    expect(screen.getByTestId('goldenQaViewCategories')).toHaveTextContent('ANC, Nutrition');
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
    expect(screen.getAllByTestId('goldenQaViewRow')[0]).toHaveTextContent('When is the first check-up?');
  });

  test('one uncategorised question reads correctly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('question,answer\nOnly one?,Yes.') })
    );
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openView();

    const summary = await screen.findByTestId('goldenQaViewSummary');
    expect(summary).toHaveTextContent('1 question · showing 1');
    expect(screen.getByTestId('goldenQaViewCategories')).toBeEmptyDOMElement();

    // nothing is categorised, so the column is left out entirely
    expect(screen.queryByRole('columnheader', { name: 'Category' })).not.toBeInTheDocument();
    expect(screen.getByTestId('goldenQaViewRow')).not.toHaveTextContent('Uncategorised');
  });

  test('the set can be exported from the table', async () => {
    const download = vi.spyOn(goldenQaUtils, 'downloadFromUrl').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(SAMPLE_CSV) }));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openView();
    fireEvent.click(await screen.findByTestId('goldenQaViewDownloadButton'));

    expect(download).toHaveBeenCalledWith('https://files.example/set.csv');
    download.mockRestore();
  });

  test('rows that cannot be read offer the download instead', async () => {
    // the storage bucket may refuse a cross-origin read
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openView();

    expect(await screen.findByTestId('goldenQaViewFailureReason')).toHaveTextContent(
      'could not be read by the browser'
    );
    expect(screen.getByTestId('goldenQaViewDownloadButton')).toBeInTheDocument();
  });

  test('a refused file read falls back too', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve('') }));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openView();

    expect(await screen.findByTestId('goldenQaViewFallback')).toBeInTheDocument();
  });

  test('a set the server will not describe falls back without a download', async () => {
    renderTab([
      listMock(oneSet),
      {
        request: { query: GET_GOLDEN_QA, variables: { id: 'g1', includeSignedUrl: true } },
        result: { data: { goldenQa: { goldenQa: null, errors: [{ message: 'gone' }] } } },
      },
    ]);

    await openView();

    expect(await screen.findByTestId('goldenQaViewFallback')).toBeInTheDocument();
    expect(screen.queryByTestId('goldenQaViewDownloadButton')).not.toBeInTheDocument();
  });

  test('closing while the file is still arriving writes nothing', async () => {
    let release: (value: any) => void = () => {};
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openView();
    fireEvent.click(screen.getByTestId('ok-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('viewGoldenQaSetDialog')).not.toBeInTheDocument();
    });

    release({ ok: true, text: () => Promise.resolve(SAMPLE_CSV) });

    await waitFor(() => {
      expect(screen.getByTestId('evaluationSubTabs')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('goldenQaViewRow')).not.toBeInTheDocument();
  });

  test('a read that fails after closing is ignored too', async () => {
    let reject: (reason: unknown) => void = () => {};
    const pending = new Promise((_resolve, fail) => {
      reject = fail;
    });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openView();
    fireEvent.click(screen.getByTestId('ok-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('viewGoldenQaSetDialog')).not.toBeInTheDocument();
    });

    reject(new TypeError('Failed to fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('evaluationSubTabs')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('goldenQaViewFallback')).not.toBeInTheDocument();
  });
});

describe('the manage dialog', () => {
  test('adding from inside it swaps to the upload dialog', async () => {
    renderTab([listMock(oneSet)]);

    await openManage();
    fireEvent.click(screen.getByTestId('addGoldenQaSetButton'));

    expect(await screen.findByTestId('addGoldenQaSetDialog')).toBeInTheDocument();
    expect(screen.queryByTestId('manageGoldenQaSetsDialog')).not.toBeInTheDocument();
  });

  test('Done closes it', async () => {
    renderTab([listMock(oneSet)]);

    await openManage();
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('manageGoldenQaSetsDialog')).not.toBeInTheDocument();
    });
  });
});

describe('remaining details', () => {
  const openUpload = async () => {
    fireEvent.click(await screen.findByTestId('addFirstSetButton'));
    return screen.findByTestId('addGoldenQaSetDialog');
  };

  test('adding with no name at all asks for one', async () => {
    renderTab();
    await openUpload();
    pickFile(csvFile(SAMPLE_CSV));
    await screen.findByTestId('goldenQaParsed');

    fireEvent.change(screen.getByTestId('goldenQaNameInput'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('ok-button'));

    expect(await screen.findByTestId('goldenQaNameError')).toHaveTextContent('a name');
  });

  test('dismissing the file browser without choosing changes nothing', async () => {
    renderTab();
    await openUpload();

    const input = screen.getByTestId('goldenQaFileInput');
    Object.defineProperty(input, 'files', { value: [], configurable: true });
    fireEvent.change(input);

    expect(screen.queryByTestId('goldenQaParsed')).not.toBeInTheDocument();
  });

  test('a file with no categories says nothing about them', async () => {
    renderTab();
    await openUpload();

    pickFile(csvFile('question,answer\nQ1,A1\nQ2,A2', 'plain.csv'));

    const parsed = await screen.findByTestId('goldenQaParsed');
    expect(parsed).toHaveTextContent('Parsed 2 questions');
    expect(parsed).not.toHaveTextContent('Categories');
  });

  test('a single question is counted in the singular', async () => {
    renderTab();
    await openUpload();

    pickFile(csvFile('question,answer\nOnly one?,Yes.', 'solo.csv'));

    expect(await screen.findByTestId('goldenQaParsed')).toHaveTextContent('Parsed 1 question');
  });

  test('with no version selected the empty run state still reads', async () => {
    render(
      <MockedProvider mocks={[listMock(oneSet)]}>
        <Evaluation />
      </MockedProvider>
    );

    expect(await screen.findByTestId('noEvaluationsYet')).toHaveTextContent('this version');
  });

  test('the fallback download uses the same signed url', async () => {
    const download = vi.spyOn(goldenQaUtils, 'downloadFromUrl').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openManage();
    fireEvent.click(screen.getByTestId('manageGoldenQaSet'));
    fireEvent.click(await screen.findByTestId('goldenQaViewDownloadButton'));

    expect(download).toHaveBeenCalledWith('https://files.example/set.csv');
    download.mockRestore();
    vi.unstubAllGlobals();
  });

  test('a set the server will not describe says the link failed', async () => {
    renderTab([
      listMock(oneSet),
      {
        request: { query: GET_GOLDEN_QA, variables: { id: 'g1', includeSignedUrl: true } },
        result: { data: { goldenQa: { goldenQa: null, errors: [{ message: 'gone' }] } } },
      },
    ]);

    await openManage();
    fireEvent.click(screen.getByTestId('manageGoldenQaSet'));

    expect(await screen.findByTestId('goldenQaViewFailureReason')).toHaveTextContent('could not be loaded');
  });

  test('a stored file with no readable questions says so', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('question,answer\n') }));
    renderTab([listMock(oneSet), viewSignedUrlMock]);

    await openManage();
    fireEvent.click(screen.getByTestId('manageGoldenQaSet'));

    expect(await screen.findByTestId('goldenQaViewFailureReason')).toHaveTextContent('No questions could be read');
    vi.unstubAllGlobals();
  });

  test('opened without a way back, the footer offers only Done', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(SAMPLE_CSV) }));
    render(
      <MockedProvider mocks={[viewSignedUrlMock]}>
        <ViewGoldenQaSetDialog set={oneSet[0]} onClose={vi.fn()} />
      </MockedProvider>
    );

    await screen.findByTestId('viewGoldenQaSetDialog');
    expect(screen.queryByTestId('middle-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('ok-button')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

test('deleting a set is shown but not offered yet', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(SAMPLE_CSV) }));
  renderTab([listMock(oneSet), viewSignedUrlMock]);

  fireEvent.click(await screen.findByTestId('manageSetsButton'));
  fireEvent.click(await screen.findByTestId('manageGoldenQaSet'));

  expect(await screen.findByTestId('deleteGoldenQaButton')).toBeDisabled();
  vi.unstubAllGlobals();
});

test('the footnote link goes straight to History', async () => {
  renderTab([listMock(oneSet)]);

  fireEvent.click(await screen.findByTestId('goToHistoryButton'));

  expect(screen.getByTestId('evaluationHistoryEmpty')).toBeInTheDocument();
  expect(screen.queryByTestId('noEvaluationsYet')).not.toBeInTheDocument();
});

test('a partly categorised file keeps the column and labels the gaps', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('question,answer,category\nQ1,A1,ANC\nQ2,A2') })
  );
  renderTab([listMock(oneSet), viewSignedUrlMock]);

  fireEvent.click(await screen.findByTestId('manageSetsButton'));
  fireEvent.click(await screen.findByTestId('manageGoldenQaSet'));

  await waitFor(() => {
    expect(screen.getAllByTestId('goldenQaViewRow')).toHaveLength(2);
  });
  expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument();
  expect(screen.getAllByTestId('goldenQaViewRow')[1]).toHaveTextContent('Uncategorised');
  vi.unstubAllGlobals();
});
