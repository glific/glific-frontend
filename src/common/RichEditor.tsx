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
  let modifiedText = text.slice(0, initialOffset) + symbol + text.slice(initialOffset);
  modifiedText = modifiedText.slice(0, finalOffset) + symbol + modifiedText.slice(finalOffset);
  return modifiedText;
};

// Convert Draft.js to WhatsApp message format.
export const convertToWhatsApp = (editorState: any) => {
  const markdownString: any = convertToRaw(editorState.getCurrentContent());
  let finalString = '';

  finalString = markdownString.blocks.map((block: any) => {
    const { text } = block;

    let offset = 0;
    let convertedText = text;
    block.inlineStyleRanges.forEach((style: any) => {
      switch (style.style) {
        case 'BOLD':
          convertedText = textConversion(convertedText, style, offset, '*');
          break;
        case 'ITALIC':
          convertedText = textConversion(convertedText, style, offset, '_');
          break;
        default:
      }
      offset += 2;
    });

    return `${finalString}${convertedText} \n`;
  });

  // let's return 0 element as map() always returns an array
  return finalString[0];
};

// Converts WhatsApp message formatting into HTML elements.
export const WhatsAppToDraftEditor = (text: string) => {
  const regexforBold = /[*][^*]*[*]/gi;

  const addedBold = text.replace(regexforBold, (str: any) => {
    return `*${str}*`;
  });

  const rawData = MarkDownConvertor.markdownToDraft(addedBold, {
    preserveNewlines: true,
  });
  const contentState = convertFromRaw(rawData);
  return contentState;
};

export const WhatsAppToJsx = (text: any) => {
  let replacements = TextReplacements;
  let modifiedText = text;
  const complexFormatting = [/(_\*.*\*_)/, /(\*_.*_\*)/];

  complexFormatting.forEach((expression) => {
    modifiedText = reactStringReplace(modifiedText, expression, (match: any, i: number) => {
      return (
        <b key={i}>
          <i>{match.slice(2, match.length - 2)}</i>
        </b>
      );
    });
  });

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
    modifiedText = reactStringReplace(
      modifiedText,
      new RegExp(regexStr, 'g'),
      (match: any, i: number) => replaceFunc(match)
    );
  }

  return modifiedText;
};
