import React from 'react';
import reactStringReplace from 'react-string-replace';
import { EditorState, ContentState } from 'draft-js';
import CallIcon from '@material-ui/icons/Call';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

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

// Convert Draft.js to WhatsApp message format.
export const getPlainTextFromEditor = (editorState: any) =>
  editorState.getCurrentContent().getPlainText();

export const getEditorFromContent = (text: string) =>
  EditorState.createWithContent(ContentState.createFromText(text));

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
  /**
   * Regular expression to check if there is buttons present in message
   * `search` will return first index of given pattern or it will return -1 if not found
   */
  const exp = /(\|\s\[)|(\|\[)/;
  const isTemplateButtonsPresent = text.search(exp);

  if (isTemplateButtonsPresent > 0) {
    const messageBody = text.substr(0, isTemplateButtonsPresent);
    const buttonsStr = text.substr(isTemplateButtonsPresent);
    const templateStr = buttonsStr.split('|');

    const buttons = templateStr
      .map((val: string) => val && val.trim().slice(1, -1))
      .filter((a) => a);

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
