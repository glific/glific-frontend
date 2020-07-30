// Storing different types of DraftJS editor states here.

export const EMPTY_STATE = {
  _immutable: {
    allowUndo: true,
    currentContent: {
      entityMap: {},
      blockMap: {
        '5oh65': {
          key: '5oh65',
          type: 'unstyled',
          text: '',
          characterList: [],
          depth: 0,
          data: {},
        },
      },
      selectionBefore: {
        anchorKey: '5oh65',
        anchorOffset: 0,
        focusKey: '5oh65',
        focusOffset: 0,
        isBackward: false,
        hasFocus: false,
      },
      selectionAfter: {
        anchorKey: '5oh65',
        anchorOffset: 0,
        focusKey: '5oh65',
        focusOffset: 0,
        isBackward: false,
        hasFocus: false,
      },
    },
    decorator: { decorators: [{ _decorators: [{}, {}] }] },
    directionMap: { '5oh65': 'LTR' },
    forceSelection: false,
    inCompositionMode: false,
    inlineStyleOverride: null,
    lastChangeType: null,
    nativelyRenderedContent: null,
    redoStack: [],
    selection: {
      anchorKey: '5oh65',
      anchorOffset: 0,
      focusKey: '5oh65',
      focusOffset: 0,
      isBackward: false,
      hasFocus: false,
    },
    treeMap: {
      '5oh65': [{ start: 0, end: 0, decoratorKey: null, leaves: [{ start: 0, end: 0 }] }],
    },
    undoStack: [],
  },
};
