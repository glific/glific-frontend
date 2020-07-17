import React from 'react';

export const TextReplacements: any = [
  {
    bold: {
      char: '*',
      tag: 'b',
      replace: (text: string) => {
        return <b>{text}</b>;
      },
    },
  },
  {
    italics: {
      char: '_',
      tag: 'i',
      replace: (text: string) => {
        return <i>{text}</i>;
      },
    },
  },
  {
    strikethrough: {
      char: '~',
      tag: 's',
      replace: (text: string) => {
        return <s>{text}</s>;
      },
    },
  },
  {
    codeBlock: {
      char: '```',
      tag: 'code',
      replace: (text: string) => {
        return <code>{text}</code>;
      },
    },
  },
];
