import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as Notification from 'common/notification';
import * as utils from 'common/utils';
import { toCsv } from 'containers/AIEvaluation/utils/csv/csv';
import * as goldenQaUtils from 'containers/AIEvaluation/utils/goldenQa/goldenQa';
import { CREATE_EVALUATION, CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import {
  GET_EVALUATION_SCORES,
  GET_GOLDEN_QA,
  LIST_AI_EVALUATIONS,
  LIST_GOLDEN_QA,
} from 'graphql/queries/AIEvaluations';
import Evaluation from './Evaluation';
import { ViewGoldenQaSetDialog } from './GoldenQA';

/*
 * The global mock returns keys verbatim, which would leave "{{count}}" in the assertions below.
 * This one fills interpolation in so the tests read the sentence a user actually sees.
 */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? key.replace(/{{(\w+)}}/g, (token, name) => (name in options ? String(options[name]) : token)) : key,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));

const listVariables = { filter: {}, opts: { order: 'DESC', orderWith: 'inserted_at' } };
const runVariables = { filter: {}, opts: { order: 'DESC', orderWith: 'inserted_at' } };

const listMock = (goldenQas: { id: string; name: string; insertedAt: string }[]) => ({
  request: { query: LIST_GOLDEN_QA, variables: listVariables },
  result: { data: { goldenQas } },
});

const oneSet = [{ id: 'g1', name: 'maternal_health_core', insertedAt: '2026-08-10T10:00:00Z' }];

const noRunsMock = {
  request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
  result: { data: { aiEvaluations: [] } },
  maxUsageCount: Number.POSITIVE_INFINITY,
};

const renderTab = (mocks: any[] = [listMock([])]) =>
  render(
    <MockedProvider mocks={[...mocks, noRunsMock]}>
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
    expect(screen.getByTestId('noEvaluationsYet')).toHaveTextContent('No evaluations yet for version 1');
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
    expect(parsed).toHaveTextContent('Parsed 2 questions');
    // the count is the whole summary — categories and rows belong in the view dialog
    expect(parsed).not.toHaveTextContent('ANC');
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

  test('picking another file re-suggests the name from it', async () => {
    renderTab();
    await openDialog();

    pickFile(csvFile(SAMPLE_CSV, 'Maternal Health.csv'));
    await waitFor(() => expect(screen.getByTestId('goldenQaNameInput')).toHaveValue('maternal_health'));

    pickFile(csvFile(SAMPLE_CSV, 'Child Nutrition.csv'));
    await waitFor(() => expect(screen.getByTestId('goldenQaNameInput')).toHaveValue('child_nutrition'));
  });

  test('a name the reader typed survives picking another file', async () => {
    renderTab();
    await openDialog();

    pickFile(csvFile(SAMPLE_CSV, 'Maternal Health.csv'));
    await waitFor(() => expect(screen.getByTestId('goldenQaNameInput')).toHaveValue('maternal_health'));

    fireEvent.change(screen.getByTestId('goldenQaNameInput'), { target: { value: 'my_own_set' } });
    pickFile(csvFile(SAMPLE_CSV, 'Child Nutrition.csv'));

    await screen.findByTestId('goldenQaParsed');
    expect(screen.getByTestId('goldenQaNameInput')).toHaveValue('my_own_set');
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

    expect(await screen.findByTestId('goldenQaParsed')).toHaveTextContent('Parsed 2 questions');
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
    expect(screen.getByTestId('goldenQaViewSummary')).toHaveTextContent(
      'Every evaluation on this set asks these 2 questions.'
    );
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
    expect(summary).toHaveTextContent('Every evaluation on this set asks this 1 question.');
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

  test('a set the server describes without a link falls back instead of spinning', async () => {
    renderTab([
      listMock(oneSet),
      {
        request: { query: GET_GOLDEN_QA, variables: { id: 'g1', includeSignedUrl: true } },
        // the query succeeded, but the stored file has no link to read it back from
        result: {
          data: {
            goldenQa: {
              goldenQa: { id: 'g1', name: 'maternal_health_core', signedUrl: null, insertedAt: '' },
              errors: null,
            },
          },
        },
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

test('many sets all render, inside a list of their own that can scroll', async () => {
  const many = Array.from({ length: 8 }, (_, index) => ({
    id: `g${index}`,
    name: `set_${index}`,
    insertedAt: '2026-08-10T10:00:00Z',
  }));
  renderTab([listMock(many)]);

  fireEvent.click(await screen.findByTestId('manageSetsButton'));

  const list = await screen.findByTestId('goldenQaSetList');
  expect(within(list).getAllByTestId('manageGoldenQaSet')).toHaveLength(8);
  // the add button stays outside the scroll area so it is always reachable
  expect(within(list).queryByTestId('addGoldenQaSetButton')).not.toBeInTheDocument();
  expect(screen.getByTestId('addGoldenQaSetButton')).toBeInTheDocument();
});

const scoresMock = (id: string, traces: any[] = []) => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: { data: { evaluationScores: { scores: JSON.stringify({ score: { traces } }), errors: [] } } },
  maxUsageCount: Number.POSITIVE_INFINITY,
});

describe('running an evaluation', () => {
  const runsMock = (aiEvaluations: any[]) => ({
    request: {
      query: LIST_AI_EVALUATIONS,
      variables: runVariables,
    },
    result: { data: { aiEvaluations } },
    maxUsageCount: Number.POSITIVE_INFINITY,
  });

  const completedRun = {
    id: 'r1',
    name: 'run_1',
    status: 'COMPLETED',
    failureReason: null,
    results:
      '{"summary_scores":[{"total_pairs":10,"std":0.64,"name":"Adherence to Ground Truth","avg":4.6},' +
      '{"total_pairs":10,"std":0.1,"name":"Adherence to Knowledge Base","avg":3.2},' +
      '{"total_pairs":10,"std":0.0,"name":"Adherence to Prompt","avg":1.4}]}',
    goldenQa: { id: 'g1', name: 'maternal_health_core', duplicationFactor: 5 },
    assistantConfigVersion: { id: 'v1', versionNumber: 1, assistant: { id: '1', name: 'Assistant' } },
    insertedAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:05:00Z',
  };

  const renderWithRuns = (runs: any[], mocks: any[] = []) =>
    render(
      <MockedProvider mocks={[listMock(oneSet), runsMock(runs), scoresMock('r1'), ...mocks]}>
        <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
      </MockedProvider>
    );

  test('the run dialog offers the sets and starts a run', async () => {
    let sent: any;
    const createMock = {
      request: { query: CREATE_EVALUATION },
      variableMatcher: (variables: any) => {
        sent = variables;
        return true;
      },
      result: { data: { createEvaluation: { evaluation: { status: 'pending' }, errors: null } } },
    };
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});

    renderWithRuns([], [createMock]);

    fireEvent.click(await screen.findByTestId('runEvaluationButton'));
    expect(await screen.findByTestId('runEvaluationDialog')).toHaveTextContent('Score version 1 against');

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
    expect(sent.input.goldenQaId).toBe('g1');
    expect(sent.input.configId).toBe('v1');
    expect(sent.input.duplicationFactor).toBe(1);
    expect(sent.input.evaluationName).toMatch(/^assistant_v1_maternal_health_core_\d+$/);
    notificationSpy.mockRestore();
  });

  test('the duplication the reader picks is what gets run', async () => {
    let sent: any;
    const createMock = {
      request: { query: CREATE_EVALUATION },
      variableMatcher: (variables: any) => {
        sent = variables;
        return true;
      },
      result: { data: { createEvaluation: { evaluation: { status: 'pending' }, errors: null } } },
    };
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});

    renderWithRuns([], [createMock]);

    fireEvent.click(await screen.findByTestId('runEvaluationButton'));
    await screen.findByTestId('runEvaluationDialog');

    // the consistency check asks each question five times
    fireEvent.click(screen.getByTestId('duplicationOption-5'));
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
    // a number, not the '5' the radio carries — the schema takes an integer
    expect(sent.input.duplicationFactor).toBe(5);
    notificationSpy.mockRestore();
  });

  test('a backend refusal is reported and the dialog stays open', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const failing = {
      request: { query: CREATE_EVALUATION },
      variableMatcher: () => true,
      result: { data: { createEvaluation: { evaluation: null, errors: [{ message: 'Quota exceeded' }] } } },
    };

    renderWithRuns([], [failing]);

    fireEvent.click(await screen.findByTestId('runEvaluationButton'));
    await screen.findByTestId('runEvaluationDialog');
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith({ message: 'Quota exceeded' });
    });
    expect(screen.getByTestId('runEvaluationDialog')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  test('a finished run replaces the empty state with its result', async () => {
    renderWithRuns([completedRun]);

    const panel = await screen.findByTestId('evaluationResult');
    expect(panel).toHaveTextContent('Version 1 · maternal_health_core · 5× duplication');
    // 4.6*.5 + 3.2*.3 + 1.4*.2 = 3.5
    expect(within(panel).getByTestId('overallScore')).toHaveTextContent('3.5');
    expect(screen.queryByTestId('noEvaluationsYet')).not.toBeInTheDocument();
  });

  test('a run still going says so instead of showing a score', async () => {
    renderWithRuns([{ ...completedRun, status: 'PENDING', results: null }]);

    expect(await screen.findByTestId('evaluationRunning')).toHaveTextContent('Evaluation in progress');
    expect(screen.queryByTestId('overallScore')).not.toBeInTheDocument();
  });

  test('History shows runs from every version', async () => {
    renderWithRuns([{ ...completedRun, assistantConfigVersion: { id: 'v2', versionNumber: 2 } }]);

    await screen.findByTestId('evaluationSubTabs');
    fireEvent.click(screen.getByRole('radio', { name: 'History' }));

    expect(await screen.findByTestId('evaluationHistory')).toHaveTextContent('Version 2');
    expect(screen.queryByTestId('evaluationHistoryEmpty')).not.toBeInTheDocument();
  });
});

describe('the result panel above the table', () => {
  const runsMock = (aiEvaluations: any[]) => ({
    request: {
      query: LIST_AI_EVALUATIONS,
      variables: runVariables,
    },
    result: { data: { aiEvaluations } },
    maxUsageCount: Number.POSITIVE_INFINITY,
  });

  const run = (overrides: any = {}) => ({
    id: 'r1',
    name: 'run_1',
    status: 'COMPLETED',
    failureReason: null,
    results:
      '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":2.6},' +
      '{"name":"Adherence to Knowledge Base","avg":2.2},{"name":"Adherence to Prompt","avg":3.4}]}',
    goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
    assistantConfigVersion: { id: 'v1', versionNumber: 1 },
    insertedAt: '2026-08-10T10:00:00Z',
    ...overrides,
  });

  const renderWithRun = (value: any) =>
    render(
      <MockedProvider mocks={[listMock(oneSet), runsMock([value]), scoresMock('r1')]}>
        <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
      </MockedProvider>
    );

  test('shows the overall score, its band, and every check with a bar', async () => {
    renderWithRun(run());

    const panel = await screen.findByTestId('evaluationResult');
    // 2.6*.5 + 2.2*.3 + 3.4*.2 = 2.64 -> 2.6
    expect(within(panel).getByTestId('overallScore')).toHaveTextContent('2.6');
    expect(within(panel).getByTestId('scoreBand')).toHaveTextContent('Could improve');
    expect(within(panel).getByTestId('scoreBand').querySelector('svg')).toHaveAttribute(
      'data-testid',
      'WarningAmberIcon'
    );

    expect(within(panel).getByTestId('metric-groundTruth')).toHaveTextContent('weight 50%');
    expect(within(panel).getByTestId('metric-knowledgeBase')).toHaveTextContent('2.2');
    expect(within(panel).getByTestId('metric-prompt')).toHaveTextContent('3.4');
    expect(within(panel).getAllByTestId('scoreBar')).toHaveLength(3);

    expect(panel).toHaveTextContent('Version 1 · core_set · 1× duplication');
  });

  test('a check the run did not score says so instead of drawing an empty bar', async () => {
    renderWithRun(
      run({
        results:
          '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":4.7},{"name":"Adherence to Prompt","avg":5}]}',
      })
    );

    const panel = await screen.findByTestId('evaluationResult');
    expect(within(panel).getByTestId('metric-knowledgeBase')).toHaveTextContent('Not scored in this run');
    expect(within(panel).getAllByTestId('scoreBar')).toHaveLength(2);
    // re-weighted over what was scored: (4.7*.5 + 5*.2) / .7
    expect(within(panel).getByTestId('overallScore')).toHaveTextContent('4.79');
    expect(within(panel).getByTestId('scoreBand')).toHaveTextContent('Good');
    expect(within(panel).getByTestId('scoreBand').querySelector('svg')).toHaveAttribute('data-testid', 'CheckIcon');
  });

  test('a run still going shows no scores at all', async () => {
    renderWithRun(run({ status: 'PENDING', results: null }));

    expect(await screen.findByTestId('evaluationRunning')).toHaveTextContent('Evaluation in progress');
    expect(screen.queryByTestId('evaluationResult')).not.toBeInTheDocument();
  });

  test('a failed run shows why', async () => {
    renderWithRun(run({ status: 'FAILED', results: null, failureReason: 'The judge timed out' }));

    expect(await screen.findByTestId('evaluationFailed')).toHaveTextContent('The judge timed out');
  });
});

test('the ring fills to the score and takes the band colour', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: {
            query: LIST_AI_EVALUATIONS,
            variables: runVariables,
          },
          result: {
            data: {
              aiEvaluations: [
                {
                  id: 'r1',
                  name: 'run',
                  status: 'COMPLETED',
                  failureReason: null,
                  // every check at 2.5, so the overall is 2.5 — half of five
                  results:
                    '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":2.5},' +
                    '{"name":"Adherence to Knowledge Base","avg":2.5},{"name":"Adherence to Prompt","avg":2.5}]}',
                  goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
                  assistantConfigVersion: { id: 'v1', versionNumber: 1 },
                  insertedAt: '2026-08-10T10:00:00Z',
                },
              ],
            },
          },
        },
      ]}
    >
      <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  const ring = await screen.findByTestId('overallScore');

  // half the score is half the sweep
  expect(ring.getAttribute('style')).toContain('180deg');
  expect(ring).toHaveTextContent('2.5/5');
  expect(ring).toHaveTextContent('Overall');
  expect(screen.getByTestId('scoreBand')).toHaveTextContent('Could improve');
});

describe('question-level results', () => {
  const runsMock = (aiEvaluations: any[]) => ({
    request: {
      query: LIST_AI_EVALUATIONS,
      variables: runVariables,
    },
    result: { data: { aiEvaluations } },
    maxUsageCount: Number.POSITIVE_INFINITY,
  });

  const completed = {
    id: 'r1',
    name: 'run',
    status: 'COMPLETED',
    failureReason: null,
    results: '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":4}]}',
    goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
    assistantConfigVersion: { id: 'v1', versionNumber: 1 },
    insertedAt: '2026-08-10T10:00:00Z',
  };

  const renderWith = (scores: any) =>
    render(
      <MockedProvider
        mocks={[
          listMock(oneSet),
          runsMock([completed]),
          {
            request: { query: GET_EVALUATION_SCORES, variables: { id: 'r1' } },
            result: { data: { evaluationScores: scores } },
          },
        ]}
      >
        <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
      </MockedProvider>
    );

  test('each question becomes a row, with a column per metric the judge used', async () => {
    renderWith({
      scores: JSON.stringify({
        score: {
          traces: [
            {
              question_id: '1',
              question: 'What is anaemia?',
              ground_truth_answer: 'Low haemoglobin.',
              llm_answer: 'A blood condition.',
              scores: [
                { name: 'Adherence to Ground Truth', value: 4.5 },
                { name: 'Adherence to Prompt', value: 1.2 },
              ],
            },
          ],
        },
      }),
      errors: [],
    });

    const rows = await screen.findAllByTestId('evaluationScoreRow');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('What is anaemia?');
    expect(rows[0]).toHaveTextContent('Low haemoglobin.');
    expect(rows[0]).toHaveTextContent('A blood condition.');
    expect(rows[0]).toHaveTextContent('4.5');
    expect(rows[0]).toHaveTextContent('1.2');

    // the shared "Adherence to" prefix is dropped so the answers get the width
    expect(screen.getByRole('columnheader', { name: 'Ground Truth' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Prompt' })).toBeInTheDocument();
    expect(screen.getByTestId('evaluationScores')).toHaveTextContent('1 question');
  });

  test('a run with no per-question results says so', async () => {
    renderWith({ scores: JSON.stringify({ score: { traces: [] } }), errors: [] });

    expect(await screen.findByTestId('evaluationScoresEmpty')).toHaveTextContent('no question-level results');
  });

  test('an error from the server is shown rather than an empty table', async () => {
    renderWith({ scores: null, errors: [{ message: 'Scores have expired' }] });

    expect(await screen.findByTestId('evaluationScoresError')).toHaveTextContent('Scores have expired');
  });
});

test('an answer is rendered the way WhatsApp would render it', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: {
            query: LIST_AI_EVALUATIONS,
            variables: runVariables,
          },
          result: {
            data: {
              aiEvaluations: [
                {
                  id: 'r1',
                  name: 'run',
                  status: 'COMPLETED',
                  failureReason: null,
                  results: '{"summary_scores":[{"name":"Adherence to Prompt","avg":5}]}',
                  goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
                  assistantConfigVersion: { id: 'v1', versionNumber: 1 },
                  insertedAt: '2026-08-10T10:00:00Z',
                },
              ],
            },
          },
        },
        {
          request: { query: GET_EVALUATION_SCORES, variables: { id: 'r1' } },
          result: {
            data: {
              evaluationScores: {
                scores: JSON.stringify({
                  score: {
                    traces: [
                      {
                        question_id: '1',
                        question: 'What is health?',
                        ground_truth_answer: 'Complete well-being.',
                        llm_answer: 'In modern biology, *health is a dynamic state*.\n\n- physically\n- mentally',
                        scores: [{ name: 'Adherence to Prompt', value: 5 }],
                      },
                    ],
                  },
                }),
                errors: [],
              },
            },
          },
        },
      ]}
    >
      <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  const row = await screen.findByTestId('evaluationScoreRow');

  // WhatsApp's bold became an element; the lines stay lines, as a recipient would see them
  expect(within(row).getByText('health is a dynamic state').tagName).toBe('B');
  expect(row.querySelectorAll('br').length).toBeGreaterThan(1);
  expect(row).toHaveTextContent('- physically');
});

test('the question-level table lives inside the result card, under a divider', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: {
            query: LIST_AI_EVALUATIONS,
            variables: runVariables,
          },
          result: {
            data: {
              aiEvaluations: [
                {
                  id: 'r1',
                  name: 'run',
                  status: 'COMPLETED',
                  failureReason: null,
                  results: '{"summary_scores":[{"name":"Adherence to Prompt","avg":5}]}',
                  goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
                  assistantConfigVersion: { id: 'v1', versionNumber: 1 },
                  insertedAt: '2026-08-10T10:00:00Z',
                },
              ],
            },
          },
        },
        {
          request: { query: GET_EVALUATION_SCORES, variables: { id: 'r1' } },
          result: {
            data: {
              evaluationScores: {
                scores: JSON.stringify({
                  score: { traces: [{ question_id: '1', question: 'Q', llm_answer: 'A', scores: [] }] },
                }),
                errors: [],
              },
            },
          },
        },
      ]}
    >
      <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  const card = await screen.findByTestId('evaluationResult');

  // one card holds the summary and the questions, rather than two stacked boxes
  expect(await within(card).findByTestId('evaluationScores')).toBeInTheDocument();
  expect(within(card).getByTestId('overallScore')).toBeInTheDocument();
});

test('a markdown table stays as text, because WhatsApp cannot render one', async () => {
  const answer = [
    'Here is a comparison:',
    '',
    '| Feature | Innate | Adaptive |',
    '| --- | --- | --- |',
    '| Onset | Immediate | Slow at first |',
    '| Memory | None | Has memory |',
  ].join('\n');

  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: {
            query: LIST_AI_EVALUATIONS,
            variables: runVariables,
          },
          result: {
            data: {
              aiEvaluations: [
                {
                  id: 'r1',
                  name: 'run',
                  status: 'COMPLETED',
                  failureReason: null,
                  results: '{"summary_scores":[{"name":"Adherence to Prompt","avg":5}]}',
                  goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
                  assistantConfigVersion: { id: 'v1', versionNumber: 1 },
                  insertedAt: '2026-08-10T10:00:00Z',
                },
              ],
            },
          },
        },
        {
          request: { query: GET_EVALUATION_SCORES, variables: { id: 'r1' } },
          result: {
            data: {
              evaluationScores: {
                scores: JSON.stringify({
                  score: { traces: [{ question_id: '1', question: 'Compare them', llm_answer: answer, scores: [] }] },
                }),
                errors: [],
              },
            },
          },
        },
      ]}
    >
      <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  const row = await screen.findByTestId('evaluationScoreRow');

  // no table is drawn — the reader sees the pipes a WhatsApp recipient would see
  expect(within(row).queryByRole('table')).not.toBeInTheDocument();
  expect(row).toHaveTextContent('| Feature | Innate | Adaptive |');
  expect(row).toHaveTextContent('| --- |');
});

test("the judge's summary is shown in the banner", async () => {
  const summary = 'Overall the run looks healthy. The one mild gap is item_0, which scored 3 on ground truth.';

  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: {
            query: LIST_AI_EVALUATIONS,
            variables: runVariables,
          },
          result: {
            data: {
              aiEvaluations: [
                {
                  id: 'r1',
                  name: 'run',
                  status: 'COMPLETED',
                  failureReason: null,
                  results: '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":4.7}]}',
                  goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
                  assistantConfigVersion: { id: 'v1', versionNumber: 1 },
                  insertedAt: '2026-08-10T10:00:00Z',
                },
              ],
            },
          },
        },
        {
          request: { query: GET_EVALUATION_SCORES, variables: { id: 'r1' } },
          result: {
            data: {
              evaluationScores: {
                scores: JSON.stringify({
                  score: { overall: { overall_score: 4.79, verdict: 'Good', ai_summary: summary }, traces: [] },
                }),
                errors: [],
              },
            },
          },
          maxUsageCount: Number.POSITIVE_INFINITY,
        },
      ]}
    >
      <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  expect(await screen.findByTestId('evaluationSummary')).toHaveTextContent('Overall the run looks healthy');
});

test('Export CSV downloads the question-level results as a CSV file', async () => {
  const download = vi.spyOn(utils, 'downloadFile').mockImplementation(() => {});
  const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:scores');

  const traces = [
    {
      question_id: '1',
      question: 'When is the first check-up?',
      ground_truth_answer: 'In the first trimester, ideally by week 12.',
      llm_answer: 'Book it early — "within 12 weeks", per the guidance.',
      scores: [
        { name: 'Adherence to Ground Truth', value: 4.5 },
        { name: 'Adherence to Prompt', value: 5 },
      ],
    },
    {
      question_id: '2',
      question: 'How much iron is needed?',
      ground_truth_answer: 'One tablet a day.',
      llm_answer: 'One a day.',
      scores: [{ name: 'Adherence to Ground Truth', value: 3 }],
    },
  ];

  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: {
            data: {
              aiEvaluations: [
                {
                  id: 'r1',
                  name: 'run',
                  status: 'COMPLETED',
                  failureReason: null,
                  results: '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":4.5}]}',
                  goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
                  assistantConfigVersion: { id: 'v1', versionNumber: 1 },
                  insertedAt: '2026-08-10T10:00:00Z',
                },
              ],
            },
          },
        },
        scoresMock('r1', traces),
      ]}
    >
      <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  fireEvent.click(await screen.findByTestId('exportScoresButton'));

  expect(download).toHaveBeenCalledWith('blob:scores', 'evaluation-r1-question-level-results.csv');

  const csv = toCsv([
    ['Question', 'Expected answer', 'Assistant answer', 'Adherence to Ground Truth', 'Adherence to Prompt'],
    [
      'When is the first check-up?',
      'In the first trimester, ideally by week 12.',
      'Book it early — "within 12 weeks", per the guidance.',
      '4.5',
      '5',
    ],
    ['How much iron is needed?', 'One tablet a day.', 'One a day.', '3', ''],
  ]);

  // commas and quotes inside an answer stay inside one field
  expect(csv).toContain('"Book it early — ""within 12 weeks"", per the guidance."');
  expect((createObjectURL.mock.calls[0][0] as Blob).size).toBe(new Blob([`\uFEFF${csv}`]).size);

  download.mockRestore();
  createObjectURL.mockRestore();
});

test('the result card waits for the score payload rather than showing a number that then changes', async () => {
  const run = {
    id: 'r1',
    name: 'run',
    status: 'COMPLETED',
    failureReason: null,
    results: '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":4.7}]}',
    goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
    assistantConfigVersion: { id: 'v1', versionNumber: 1 },
    insertedAt: '2026-08-10T10:00:00Z',
  };

  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: { data: { aiEvaluations: [run] } },
        },
        { request: { query: GET_EVALUATION_SCORES, variables: { id: 'r1' } }, delay: Infinity, result: { data: {} } },
      ]}
    >
      <Evaluation versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  await screen.findByTestId('evaluationTab');

  const panel = await screen.findByTestId('evaluationResult');

  expect(panel).toHaveTextContent('Version 1 · core_set');
  expect(within(panel).getByTestId('evaluationScoreLoading')).toBeInTheDocument();
  expect(within(panel).getByTestId('metric-groundTruth')).toBeInTheDocument();
  expect(within(panel).queryByTestId('overallScore')).not.toBeInTheDocument();
  expect(screen.queryByTestId('evaluationSummary')).not.toBeInTheDocument();
  // and it is not sitting next to "nothing has run yet", which is a different state
  expect(screen.queryByTestId('noEvaluationsYet')).not.toBeInTheDocument();
});

test('only the tab name in the footnote is the link', async () => {
  renderTab([listMock(oneSet)]);

  const link = await screen.findByTestId('goToHistoryButton');

  // the sentence reads whole, but the reader can only click the tab name
  expect(link).toHaveTextContent('History');
  expect(link.parentElement).toHaveTextContent('See every past run in the History tab');
  expect(link.textContent).toBe('History');
});

test('the first file picked clears the "choose a file" error', async () => {
  renderTab();
  fireEvent.click(await screen.findByTestId('addFirstSetButton'));
  await screen.findByTestId('addGoldenQaSetDialog');

  pickFile(csvFile(SAMPLE_CSV, 'Maternal Health.csv'));

  await screen.findByTestId('goldenQaParsed');
  expect(screen.queryByTestId('goldenQaFileError')).not.toBeInTheDocument();
});

const runFor = (id: string, assistantId: string, setName: string) => ({
  id,
  name: `run_${id}`,
  status: 'COMPLETED',
  failureReason: null,
  results: '{"summary_scores":[{"name":"Adherence to Ground Truth","avg":4.7}]}',
  goldenQa: { id: 'g1', name: setName, duplicationFactor: 1 },
  assistantConfigVersion: { id: `v-${id}`, versionNumber: 1, assistant: { id: assistantId, name: 'A' } },
  insertedAt: '2026-08-10T10:00:00Z',
});

test('History lists this assistant’s runs only, not the whole organisation’s', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: { data: { aiEvaluations: [runFor('r1', 'a1', 'mine'), runFor('r2', 'a2', 'someone_elses')] } },
          maxUsageCount: Number.POSITIVE_INFINITY,
        },
        scoresMock('r1'),
      ]}
    >
      <Evaluation assistantId="a1" versionId="v-r1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  fireEvent.click(await screen.findByTestId('evaluationSubTabs-history'));

  const rows = await screen.findAllByTestId('evaluationRun');
  expect(rows).toHaveLength(1);
  expect(rows[0]).toHaveTextContent('mine');
  expect(rows[0]).not.toHaveTextContent('someone_elses');
});

test('a run still being judged shows as in progress and asks for no scores', async () => {
  const running = { ...runFor('r1', 'a1', 'mine'), status: 'PENDING', results: null };

  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: { data: { aiEvaluations: [running] } },
          maxUsageCount: Number.POSITIVE_INFINITY,
        },
      ]}
    >
      <Evaluation assistantId="a1" versionId="v-r1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  expect(await screen.findByTestId('evaluationRunning')).toBeInTheDocument();
  // and nothing asks for scores while there are none to read
  expect(screen.queryByTestId('evaluationScores')).not.toBeInTheDocument();
});

test('the two ways of running are offered as cards, and the choice sticks', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: { data: { aiEvaluations: [] } },
        },
      ]}
    >
      <Evaluation assistantId="a1" versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  fireEvent.click(await screen.findByTestId('runEvaluationButton'));
  await screen.findByTestId('runEvaluationDialog');

  const quick = screen.getByTestId('duplicationOption-1');
  const consistency = screen.getByTestId('duplicationOption-5');

  // each card explains the trade-off, which is why it is a card and not a segment
  expect(quick).toHaveTextContent('Quick smoke test');
  expect(quick).toHaveTextContent('Asks each question once');
  expect(consistency).toHaveTextContent('Consistency check');
  expect(quick).toHaveAttribute('aria-checked', 'true');

  fireEvent.click(consistency);

  expect(screen.getByTestId('duplicationOption-5')).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('duplicationOption-1')).toHaveAttribute('aria-checked', 'false');
});

test('a second run cannot be started while one is still going', async () => {
  const running = { ...runFor('r1', 'a1', 'mine'), status: 'PENDING', results: null };

  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: { data: { aiEvaluations: [running] } },
          maxUsageCount: Number.POSITIVE_INFINITY,
        },
      ]}
    >
      <Evaluation assistantId="a1" versionId="v-r1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  await screen.findByTestId('evaluationRunning');
  expect(screen.getByTestId('runEvaluationButton')).toBeDisabled();
});

test('once the run settles another one can be started', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: { data: { aiEvaluations: [runFor('r1', 'a1', 'mine')] } },
          maxUsageCount: Number.POSITIVE_INFINITY,
        },
        scoresMock('r1'),
      ]}
    >
      <Evaluation assistantId="a1" versionId="v-r1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  await screen.findByTestId('evaluationResult');
  expect(screen.getByTestId('runEvaluationButton')).toBeEnabled();
});

test('the meta line puts the weight on the Golden Q&A set', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        {
          request: { query: LIST_AI_EVALUATIONS, variables: runVariables },
          result: { data: { aiEvaluations: [runFor('r1', 'a1', 'ai_cohort_v2_1')] } },
          maxUsageCount: Number.POSITIVE_INFINITY,
        },
        scoresMock('r1'),
      ]}
    >
      <Evaluation assistantId="a1" versionId="v-r1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  const panel = await screen.findByTestId('evaluationResult');

  expect(panel).toHaveTextContent('Version 1 · ai_cohort_v2_1 · 1× duplication');
  expect(panel.querySelector('b')).toHaveTextContent('ai_cohort_v2_1');
});

describe('what the drop zone will accept', () => {
  const openUpload = async () => {
    fireEvent.click(await screen.findByTestId('addFirstSetButton'));
    return screen.findByTestId('addGoldenQaSetDialog');
  };

  test('a file that is not a CSV is refused before it is read', async () => {
    renderTab();
    await openUpload();

    const notCsv = new File(['<html></html>'], 'report.html', { type: 'text/html' });
    fireEvent.drop(screen.getByTestId('goldenQaDropZone'), { dataTransfer: { files: [notCsv] } });

    expect(await screen.findByTestId('goldenQaFileError')).toHaveTextContent('Choose a .csv file');
    expect(screen.queryByTestId('goldenQaParsed')).not.toBeInTheDocument();
  });

  test('a CSV over the size ceiling is refused before it is read', async () => {
    renderTab();
    await openUpload();

    const huge = csvFile(SAMPLE_CSV, 'huge.csv');
    // a real 20MB+ file would be slow to build, so only the size the check reads is faked
    Object.defineProperty(huge, 'size', { value: 21 * 1024 * 1024 });
    pickFile(huge);

    expect(await screen.findByTestId('goldenQaFileError')).toHaveTextContent('larger than 20MB');
    expect(screen.queryByTestId('goldenQaParsed')).not.toBeInTheDocument();
  });

  test('a CSV within the ceiling is read as before', async () => {
    renderTab();
    await openUpload();

    pickFile(csvFile(SAMPLE_CSV));

    expect(await screen.findByTestId('goldenQaParsed')).toHaveTextContent('Parsed 2 questions');
    expect(screen.queryByTestId('goldenQaFileError')).not.toBeInTheDocument();
  });
});

test('a failed runs fetch says so instead of claiming nothing has run', async () => {
  render(
    <MockedProvider
      mocks={[
        listMock(oneSet),
        { request: { query: LIST_AI_EVALUATIONS, variables: runVariables }, error: new Error('network') },
      ]}
    >
      <Evaluation assistantId="a1" versionId="v1" versionNumber={1} assistantName="Assistant" />
    </MockedProvider>
  );

  expect(await screen.findByTestId('evaluationRunsLoadError')).toHaveTextContent('could not be loaded');
  expect(screen.queryByTestId('noEvaluationsYet')).not.toBeInTheDocument();
});
