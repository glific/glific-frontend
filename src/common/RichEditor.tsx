import React from 'react';
import reactStringReplace from 'react-string-replace';
import { convertToRaw, convertFromRaw } from 'draft-js';
import CallIcon from '@material-ui/icons/Call';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const MarkDownConvertor = require('markdown-draft-js');

// Indicates how to replace different parts of the text from WhatsApp to HTML.
const regexForLink =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;
export const TextReplacements: any = [
  {
    bold: {
      char: '*',
      tag: 'b',
      replace: (text: string) => <b key={text}>{text}</b>,
    },
  },
  {
    italics: {
      char: '_',
      tag: 'i',
      replace: (text: string) => <i>{text}</i>,
    },
  },
  {
    strikethrough: {
      char: '~',
      tag: 's',
      replace: (text: string) => <s>{text}</s>,
    },
  },
  {
    codeBlock: {
      char: '``',
      tag: 'code',
      replace: (text: string) => <code>{text}</code>,
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
  let finalString: any = [];

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
    return `${finalString}${convertedText}\n`;
  });

  // let's return 0 element as map() always returns an array
  return finalString.join('');
};

// Converts WhatsApp message formatting into HTML elements.
export const WhatsAppToDraftEditor = (text: string) => {
  const regexforBold = /[*][^*]*[*]/gi;

  const addedBold = text.replace(regexforBold, (str: any) => `*${str}*`);

  const rawData = MarkDownConvertor.markdownToDraft(addedBold, {
    preserveNewlines: true,
  });
  const contentState = convertFromRaw(rawData);
  return contentState;
};

export const WhatsAppToJsx = (text: any) => {
  const replacements = TextReplacements;
  let modifiedText = text;
  // regex for checking whatsapp formatting for both bold and italic
  const complexFormatting = [/(_\*.*\*_)/, /(\*_.*_\*)/];
  // regex for checking links in the message

  if (typeof text === 'string') {
    // search for all the links in the message
    const allLinks = [...modifiedText.matchAll(regexForLink)];

    if (allLinks.length > 0) {
      allLinks.forEach((link) => {
        // add anchor tag for each link
        modifiedText = reactStringReplace(modifiedText, link[0], (match: any, index: number) => {
          const key = `messageLink-${index}`;
          return (
            <a
              href={match}
              data-testid="messageLink"
              target="_blank"
              rel="noopener noreferrer"
              key={key}
            >
              {match}
            </a>
          );
        });
      });
    }
  }

  complexFormatting.forEach((expression) => {
    modifiedText = reactStringReplace(modifiedText, expression, (match: any, i: number) => (
      <b key={i}>
        <i>{match.slice(2, match.length - 2)}</i>
      </b>
    ));
  });

  replacements.forEach((replacement: any) => {
    const type = Object.keys(replacement)[0];
    const character: any = replacement[type].char;
    const replaceFunc: any = replacement[type].replace;
    const regexStr = `\\${character}{${character.length}}(.+?)\\${character}{${character.length}}`;
    modifiedText = reactStringReplace(modifiedText, new RegExp(regexStr, 'g'), (match: any) =>
      replaceFunc(match)
    );
  });

  return modifiedText;
};

export const WhatsAppTemplateButton = (text: string) => {
  const result: any = { body: text, buttons: null };

  // Returning early if text is null
  if (!text) return result;
  // Checking if template consists of buttons or not because they are separated with `|`
  const isTemplateButtonsPresent = text.indexOf('|');
  if (isTemplateButtonsPresent > 0) {
    const templateStr = text.split('|');
    const templateButtons = templateStr.map((val: string, index: number) => {
      /**
       * templateStr 0th element is template message
       * otherwise slice from 1 to last value
       * For removing `[]` brackets
       */
      if (index === 0) return val.trim();
      return val.trim().slice(1, -1);
    });
    const [messageBody, ...buttons] = templateButtons;

    // Checking if template type is call to action or quick reply

    const btnWithKeyValues = buttons.map((btn: string) => {
      if (btn.indexOf(',') > 0) {
        const [key, value]: any = btn.split(',');
        // Checking if given value is valid link
        const [link] = [...value.matchAll(regexForLink)];
        const callToActionButton: any = {
          title: key.trim(),
          value: null,
          type: 'call-to-action',
          tooltip: 'Currently not supported',
          icon: <CallIcon />,
        };
        if (link) {
          const [url] = link;
          callToActionButton.value = url;
          callToActionButton.tooltip = '';
          callToActionButton.icon = <OpenInNewIcon />;
        }
        return callToActionButton;
      }
      return { title: btn, value: btn, type: 'quick-reply' };
    });

    result.body = messageBody;
    result.buttons = btnWithKeyValues;
  }

  return result;
};
