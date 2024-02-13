import { FormControl, MenuItem, Paper, Select, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import styles from './ChatInterface.module.css';
import ChatMessages from 'containers/Chat/ChatMessages/ChatMessages';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import SimulatorIcon from 'assets/images/icons/Simulator.svg?react';
import CollectionConversations from 'containers/Chat/CollectionConversations/CollectionConversations';
import ChatConversations from 'containers/Chat/ChatConversations/ChatConversations';

interface GroupCHatInterfaceProps {
  collections?: boolean;
}

const tabs = [
  {
    label: 'Groups',
    link: '/group/chat/',
  },
  {
    label: 'Collections',
    link: '/group/chat/collection/',
  },
];

export const GroupChatInterface = ({ collections }: GroupCHatInterfaceProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [value, setValue] = useState(tabs[0].link);
  const params = useParams();
  const phoneNumbers = [
    { label: '9875467287', value: '9875467287' },
    { label: '9876452719', value: '9876452719' },
    { label: '9736472891', value: '9736472891' },
  ];
  const [phoneNumber, setPhoneNumber] = useState<any>(phoneNumbers[0].label);

  let selectedContactId = params.contactId;
  let selectedCollectionId: any = params.collectionId;
  let chatData = [
    {
      __typename: 'Conversation',
      contact: {
        __typename: 'Contact',
        id: '6',
        name: 'Glific Simulator Five',
        phone: '9876543210_5',
        fields: '{}',
        maskedPhone: '9876******_5',
        lastMessageAt: '2024-02-13T05:24:38Z',
        status: 'VALID',
        bspStatus: 'SESSION',
        isOrgRead: true,
      },
      group: null,
      messages: [
        {
          __typename: 'Message',
          id: '736',
          body: 'sajhk',
          insertedAt: '2024-02-13T06:39:31.448450Z',
          messageNumber: 13,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '735',
          body: '\nsdf',
          insertedAt: '2024-02-13T06:00:19.584675Z',
          messageNumber: 12,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '734',
          body: 'ccv',
          insertedAt: '2024-02-13T06:00:15.732691Z',
          messageNumber: 11,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '733',
          body: '',
          insertedAt: '2024-02-13T05:29:17.301817Z',
          messageNumber: 10,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'STICKER',
          media: {
            __typename: 'MessageMedia',
            url: 'http://www.buildquickbots.com/whatsapp/stickers/SampleSticker01.webp',
            caption: null,
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '732',
          body: '',
          insertedAt: '2024-02-13T05:29:02.916835Z',
          messageNumber: 9,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'DOCUMENT',
          media: {
            __typename: 'MessageMedia',
            url: 'https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf',
            caption: 'Document 1707802138033',
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '731',
          body: '',
          insertedAt: '2024-02-13T05:28:49.961972Z',
          messageNumber: 8,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'VIDEO',
          media: {
            __typename: 'MessageMedia',
            url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            caption: 'Video 1707802124894',
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '730',
          body: '',
          insertedAt: '2024-02-13T05:28:36.579549Z',
          messageNumber: 7,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'AUDIO',
          media: {
            __typename: 'MessageMedia',
            url: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
            caption: null,
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '729',
          body: '',
          insertedAt: '2024-02-13T05:28:21.535743Z',
          messageNumber: 6,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'IMAGE',
          media: {
            __typename: 'MessageMedia',
            url: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg',
            caption: 'Image 1707802096783',
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '728',
          body: 'Sample Message for testing 1707802061817',
          insertedAt: '2024-02-13T05:27:42.826452Z',
          messageNumber: 5,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '727',
          body: '',
          insertedAt: '2024-02-13T05:27:03.269750Z',
          messageNumber: 4,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'IMAGE',
          media: {
            __typename: 'MessageMedia',
            url: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg',
            caption: 'Image 1707802018582',
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '726',
          body: 'Sample Message for testing 1707801988297',
          insertedAt: '2024-02-13T05:26:29.306402Z',
          messageNumber: 3,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '719',
          body: 'Sample Message for testing 1707801834955',
          insertedAt: '2024-02-13T05:24:40.584118Z',
          messageNumber: 2,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Staff',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '718',
          body: 'Default message body',
          insertedAt: '2024-02-13T05:24:39.002088Z',
          messageNumber: 1,
          receiver: {
            __typename: 'Contact',
            id: '6',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
      ],
    },
    {
      __typename: 'Conversation',
      contact: {
        __typename: 'Contact',
        id: '3',
        name: 'Glific Simulator Two',
        phone: '9876543210_2',
        fields: '{}',
        maskedPhone: '9876******_2',
        lastMessageAt: '2024-02-13T05:11:57Z',
        status: 'VALID',
        bspStatus: 'SESSION_AND_HSM',
        isOrgRead: false,
      },
      group: null,
      messages: [
        {
          __typename: 'Message',
          id: '692',
          body: '',
          insertedAt: '2024-02-13T05:13:05.068040Z',
          messageNumber: 376,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'AUDIO',
          media: {
            __typename: 'MessageMedia',
            url: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
            caption: null,
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '691',
          body: '',
          insertedAt: '2024-02-13T05:12:51.538258Z',
          messageNumber: 375,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'IMAGE',
          media: {
            __typename: 'MessageMedia',
            url: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample01.jpg',
            caption: 'Image 1707801158133',
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '690',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:12:26.446788Z',
          messageNumber: 374,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '689',
          body: '😀',
          insertedAt: '2024-02-13T05:12:12.001074Z',
          messageNumber: 373,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '688',
          body: 'Sample Message for testing 1707801122713',
          insertedAt: '2024-02-13T05:12:05.107336Z',
          messageNumber: 372,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '687',
          body: 'Hi',
          insertedAt: '2024-02-13T05:11:56.924638Z',
          messageNumber: 371,
          receiver: {
            __typename: 'Contact',
            id: '1',
          },
          sender: {
            __typename: 'Contact',
            id: '3',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: '',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '679',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:07:12.564528Z',
          messageNumber: 370,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '678',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:06:53.294198Z',
          messageNumber: 369,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '677',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:05:59.930101Z',
          messageNumber: 368,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '676',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:03:47.139712Z',
          messageNumber: 367,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '675',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:02:51.231393Z',
          messageNumber: 366,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '674',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:01:04.246643Z',
          messageNumber: 365,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '673',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T04:58:42.614189Z',
          messageNumber: 364,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '672',
          body: 'You can now view your Account Balance or Mini statement for Account ending with Glific Simulator Two simply by selecting one of the options below.| [View Account Balance] | [View Mini Statement] ',
          insertedAt: '2024-02-13T04:57:11.748766Z',
          messageNumber: 363,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '671',
          body: 'You can now view your Account Balance or Mini statement for Account ending with Glific Simulator Two simply by selecting one of the options below.| [View Account Balance] | [View Mini Statement] ',
          insertedAt: '2024-02-13T04:56:56.041560Z',
          messageNumber: 362,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '670',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T04:55:48.841279Z',
          messageNumber: 361,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '669',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T04:53:06.138337Z',
          messageNumber: 360,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '668',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T04:51:06.496377Z',
          messageNumber: 359,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '667',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T04:48:46.542424Z',
          messageNumber: 358,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '666',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T04:48:17.563114Z',
          messageNumber: 357,
          receiver: {
            __typename: 'Contact',
            id: '3',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
      ],
    },
    {
      __typename: 'Conversation',
      contact: {
        __typename: 'Contact',
        id: '4',
        name: 'Glific Simulator Three',
        phone: '9876543210_3',
        fields: '{}',
        maskedPhone: '9876******_3',
        lastMessageAt: '2024-02-13T05:09:25Z',
        status: 'VALID',
        bspStatus: 'SESSION_AND_HSM',
        isOrgRead: false,
      },
      group: null,
      messages: [
        {
          __typename: 'Message',
          id: '686',
          body: '',
          insertedAt: '2024-02-13T05:10:13.634500Z',
          messageNumber: 99,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'AUDIO',
          media: {
            __typename: 'MessageMedia',
            url: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
            caption: null,
          },
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '685',
          body: 'Hi ABC,\nPlease find the attached bill.',
          insertedAt: '2024-02-13T05:09:44.846408Z',
          messageNumber: 98,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '684',
          body: 's🥲😍😍',
          insertedAt: '2024-02-13T05:09:40.607848Z',
          messageNumber: 97,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '683',
          body: '😀',
          insertedAt: '2024-02-13T05:09:35.483514Z',
          messageNumber: 96,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '682',
          body: 'Sample Message for testing 1707800969419',
          insertedAt: '2024-02-13T05:09:30.244396Z',
          messageNumber: 95,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '681',
          body: 'Thank you for reaching out. This is your help message along with some options-\n      \n*Type 1* for option 1\n*Type 2* for option 2\n*Type 3* for option 3\n*Type 4* to optout and stop receiving our messages',
          insertedAt: '2024-02-13T05:09:25.691387Z',
          messageNumber: 94,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'Flow: Help Workflow',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '680',
          body: 'Hi',
          insertedAt: '2024-02-13T05:09:25.332254Z',
          messageNumber: 93,
          receiver: {
            __typename: 'Contact',
            id: '1',
          },
          sender: {
            __typename: 'Contact',
            id: '4',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: '',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '647',
          body: 'Thank you for reaching out. This is your help message along with some options-\n      \n*Type 1* for option 1\n*Type 2* for option 2\n*Type 3* for option 3\n*Type 4* to optout and stop receiving our messages',
          insertedAt: '2024-02-13T03:52:49.010129Z',
          messageNumber: 92,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'Flow: Help Workflow',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '646',
          body: 'Hi',
          insertedAt: '2024-02-13T03:52:48.628556Z',
          messageNumber: 91,
          receiver: {
            __typename: 'Contact',
            id: '1',
          },
          sender: {
            __typename: 'Contact',
            id: '4',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: '',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '547',
          body: 'h',
          insertedAt: '2024-02-08T19:54:30.237787Z',
          messageNumber: 90,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '546',
          body: 'e',
          insertedAt: '2024-02-08T19:54:26.359203Z',
          messageNumber: 89,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '545',
          body: 'Glific comes with all new features',
          insertedAt: '2024-02-08T19:53:28.277190Z',
          messageNumber: 88,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'QUICK_REPLY',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"yes"},{"type":"text","title":"no"}],"content":{"type":"text","text":"Glific comes with all new features","header":"Are you excited for Glific"}}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '544',
          body: 'You can now view your Account Balance or Mini statement for Account ending with Glific Simulator Three simply by selecting one of the options below.| [View Account Balance] | [View Mini Statement] ',
          insertedAt: '2024-02-08T19:53:12.709053Z',
          messageNumber: 87,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '543',
          body: 'sjha😀',
          insertedAt: '2024-02-08T19:53:02.058910Z',
          messageNumber: 86,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '542',
          body: 'Would you like to learn more about Glific?',
          insertedAt: '2024-02-08T19:52:49.026244Z',
          messageNumber: 85,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'QUICK_REPLY',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent:
            '{"type":"quick_reply","options":[{"type":"text","title":"👍 Yes"},{"type":"text","title":"👎 No"}],"content":{"type":"text","text":"Would you like to learn more about Glific?","header":"More about Glific","caption":""}}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '541',
          body: 'You can now view your Account Balance or Mini statement for Account ending with Glific Simulator Three simply by selecting one of the options below.| [View Account Balance] | [View Mini Statement] ',
          insertedAt: '2024-02-08T19:46:48.581477Z',
          messageNumber: 84,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: '',
        },
        {
          __typename: 'Message',
          id: '540',
          body: '*hjvbhyh* _hhhkkhj_🤗😊😍',
          insertedAt: '2024-02-08T19:46:06.700945Z',
          messageNumber: 83,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '539',
          body: '*jkzfddhjkf* _hj_',
          insertedAt: '2024-02-08T19:06:20.576108Z',
          messageNumber: 82,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '538',
          body: '*jkzfddhjkf* _hj_',
          insertedAt: '2024-02-08T19:04:51.837501Z',
          messageNumber: 81,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
        {
          __typename: 'Message',
          id: '537',
          body: '*sdhjsdh*',
          insertedAt: '2024-02-08T18:55:55.932494Z',
          messageNumber: 80,
          receiver: {
            __typename: 'Contact',
            id: '4',
          },
          sender: {
            __typename: 'Contact',
            id: '1',
          },
          location: null,
          type: 'TEXT',
          media: null,
          errors: '{}',
          contextMessage: null,
          interactiveContent: '{}',
          sendBy: 'NGO Main Account',
          flowLabel: null,
        },
      ],
    },
  ];
  let heading;
  let selectedTab = 'contacts';

  if (collections) {
    selectedTab = 'collections';
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    navigate(newValue);
  };

  let conversationsSection;
  let listingSection;

  if (
    !selectedContactId &&
    collections &&
    !selectedCollectionId &&
    chatData &&
    chatData.length !== 0
  ) {
    if (chatData[0].contact) {
      selectedContactId = chatData[0].contact.id;
    }
  }

  if (!selectedContactId && !selectedCollectionId && chatData && chatData.length !== 0) {
    if (chatData[0].contact) {
      selectedContactId = chatData[0].contact.id;
    }
  }

  if (chatData.length === 0) {
    conversationsSection = (
      <Typography variant="h5" className={styles.NoConversations}>
        {t('There are no chat conversations to display.')}
      </Typography>
    );
  } else {
    if (selectedCollectionId || selectedTab === 'collections') {
      listingSection = <CollectionConversations collectionId={selectedCollectionId} />;
      heading = 'Collections';
    } else if (selectedContactId) {
      // let's enable simulator only when contact tab is shown
      listingSection = <ChatConversations contactId={selectedContactId} />;
      heading = 'Groups';
    }
    conversationsSection = (
      <>
        <div className={`${styles.ChatMessages} chatMessages`}>
          <ChatMessages contactId={selectedContactId} collectionId={selectedCollectionId} />
        </div>

        <div className={`${styles.ChatConversations} ChatConversations`}>
          <div className={styles.Title}>
            <div className={styles.Heading}> {heading}</div>
          </div>

          <div className={styles.FilterContainer}>
            <FormControl>
              <Select
                aria-label="phonenumber"
                name="phonenumber"
                value={phoneNumber}
                onChange={(event) => {
                  const { value } = event.target;
                  setPhoneNumber(JSON.parse(value));
                }}
                className={styles.SearchBar}
              >
                {phoneNumbers.map((filter: any) => (
                  <MenuItem key={filter.label} value={filter.value}>
                    {filter.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className={styles.SyncButton}>Sync</div>
          </div>

          <div className={styles.TabContainer}>
            <Tabs value={value} onChange={handleTabChange} aria-label="chat tabs">
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
                  classes={{ selected: styles.TabSelected }}
                  className={styles.Tab}
                  label={tab.label}
                  value={tab.link}
                  disableRipple
                />
              ))}
            </Tabs>
          </div>

          <div>{listingSection}</div>
        </div>
      </>
    );
  }
  return (
    <Paper>
      <div className={styles.Chat} chatData-testid="chatContainer">
        {conversationsSection}
      </div>
      {selectedTab === 'contacts' && (
        <SimulatorIcon
          chatData-testid="simulatorIcon"
          className={styles.SimulatorIcon}
          onClick={() => {}}
        />
      )}
    </Paper>
  );
};
