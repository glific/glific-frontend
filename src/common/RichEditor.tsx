import React from 'react';
import reactStringReplace from 'react-string-replace';
import { draftToMarkdown } from 'markdown-draft-js';
import { convertToRaw } from 'draft-js';

// Indicates how to replace different parts of the text from WhatsApp to HTML.
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

// Finds double asterisks in text with a regular expression.
export const findDoubleAsterisks = new RegExp(/\*{2}(.+?)\*{2}/g);

// Convert Draft.js to WhatsApp message format.
export const convertToWhatsApp = (editorState: any) => {
  let markdownString = draftToMarkdown(convertToRaw(editorState.getCurrentContent()));
  let messageText = markdownString.replace(findDoubleAsterisks, '*$1*');
  return messageText;
};

// Converts WhatsApp message formatting into HTML elements.
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
