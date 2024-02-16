import CallIcon from '@mui/icons-material/Call';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Interweave } from 'interweave';
import { UrlMatcher } from 'interweave-autolink';

// Indicates how to replace different parts of the text from WhatsApp to HTML.
const regexForLink =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;

export const getTextContent = (editorState: any) => editorState?.getRootElement()?.textContent;

const isAlphanumeric = (c: any) => {
  const x = c.charCodeAt();
  return (x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57);
};

const whatsappStyles = (format: any, wildcard: any, opTag: any, clTag: any) => {
  let formatObject = format;
  const indices = [];
  for (let i = 0; i < formatObject.length; i += 1) {
    if (formatObject[i] === wildcard) {
      if (indices.length % 2) {
        if (formatObject[i - 1] !== ' ') {
          if (typeof formatObject[i + 1] === 'undefined') {
            indices.push(i);
          } else if (!isAlphanumeric(formatObject[i + 1])) {
            indices.push(i);
          }
        }
      } else if (typeof formatObject[i + 1] !== 'undefined') {
        if (formatObject[i + 1] !== ' ') {
          if (typeof formatObject[i - 1] === 'undefined') {
            indices.push(i);
          } else if (!isAlphanumeric(formatObject[i - 1])) {
            indices.push(i);
          }
        }
      }
    } else if (formatObject[i].charCodeAt() === 10 && indices.length % 2) {
      indices.pop();
    }
  }

  if (indices.length % 2) {
    indices.pop();
  }

  let e = 0;
  indices.forEach((v, i) => {
    const t = i % 2 ? clTag : opTag;
    let indice = v;
    indice += e;
    formatObject = formatObject.substr(0, indice) + t + formatObject.substr(indice + 1);
    e += t.length - 1;
  });
  return formatObject;
};

const showLivePreview = (format: any) => {
  let formatObject = format;
  formatObject = new Option(formatObject).innerHTML;
  formatObject = whatsappStyles(formatObject, '_', '<i>', '</i>');
  formatObject = whatsappStyles(formatObject, '*', '<b>', '</b>');
  formatObject = whatsappStyles(formatObject, '~', '<s>', '</s>');
  formatObject = formatObject.replace(/\n/gi, '<br>');
  return formatObject;
};

export const WhatsAppToJsx = (text: any) => {
  let modifiedText = text;

  if (typeof text === 'string') {
    modifiedText = showLivePreview(modifiedText);
    // search for all the links in the message
    return <Interweave content={modifiedText} matchers={[new UrlMatcher('url')]} />;
  }

  return text;
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
    const messageBody = text.substring(0, isTemplateButtonsPresent);
    const buttonsStr = text.substring(isTemplateButtonsPresent);
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
