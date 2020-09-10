import React from 'react';
import reactStringReplace from 'react-string-replace';
import { convertToRaw, convertFromRaw } from 'draft-js';
const MarkDownConvertor = require('markdown-draft-js');

// Indicates how to replace different parts of the text from WhatsApp to HTML.
export const TextReplacements: any = [
  {
    bold: {
      char: '*',
      tag: 'b',
      replace: (text: string) => {
        return <b key={text}>{text}</b>;
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
      char: '``',
      tag: 'code',
      replace: (text: string) => {
        return <code>{text}</code>;
      },
    },
  },
];

// Finds double asterisks in text with a regular expression.

const textConversion = (text: any, style: any, offset: number, symbol: string) => {
  const initialOffset = style.offset + offset;
  const finalOffset = initialOffset + style.length + 1;
  text = text.slice(0, initialOffset) + symbol + text.slice(initialOffset);
  text = text.slice(0, finalOffset) + symbol + text.slice(finalOffset);
  return text;
};

// Convert Draft.js to WhatsApp message format.
export const convertToWhatsApp = (editorState: any) => {
  let markdownString: any = convertToRaw(editorState.getCurrentContent());
  let finalString = '';

  markdownString.blocks.map((block: any) => {
    let text = block.text;

    let offset = 0;
    block.inlineStyleRanges.map((style: any) => {
      switch (style.style) {
        case 'BOLD':
          text = textConversion(text, style, offset, '*');
          break;
        case 'ITALIC':
          text = textConversion(text, style, offset, '_');
          break;
      }
      offset += 2;
    });
    finalString = finalString + text + '\n';
  });

  return finalString;
};

// Converts WhatsApp message formatting into HTML elements.

export const WhatsAppToDraftEditor = (text: string) => {
  const regexforBold = /[*][^*]*[*]/gi;

  const addedBold = text.replace(regexforBold, function (str: any) {
    return '*' + str + '*';
  });

  const rawData = MarkDownConvertor.markdownToDraft(addedBold, {
    preserveNewlines: true,
  });
  const contentState = convertFromRaw(rawData);
  return contentState;
};

export const WhatsAppToJsx = (text: any) => {
  let replacements = TextReplacements;
  for (let i = 0; i < replacements.length; i++) {
    let type = Object.keys(replacements[i])[0];
    let character: any = replacements[i][type].char;
    let replaceFunc: any = replacements[i][type].replace;
    // let regexStr = `\\${character}{${character.length}}(.+?)\\${character}{${character.length}}`;
    let regexStr =
      '\\' +
      character +
      '{' +
      character.length +
      '}(.+?)\\' +
      character +
      '{' +
      character.length +
      '}';
    text = reactStringReplace(text, new RegExp(regexStr, 'g'), (match: any, i: number) =>
      replaceFunc(match)
    );
  }

  return text;
};
