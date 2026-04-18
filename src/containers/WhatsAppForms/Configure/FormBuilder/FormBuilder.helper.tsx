import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

export const formComponenets = [
  {
    icon: <TextFieldsIcon />,
    name: 'Text',
    children: [
      {
        icon: <TextFieldsIcon />,
        name: 'Large Heading',
      },
      {
        icon: <TextFieldsIcon />,
        name: 'Small Heading',
      },
      {
        icon: <TextFieldsIcon />,
        name: 'Caption',
      },
      {
        icon: <TextFieldsIcon />,
        name: 'Body',
      },
    ],
  },
  {
    icon: <ImageOutlinedIcon />,
    name: 'Media',
    children: [{ name: 'Image', icon: <ImageOutlinedIcon /> }],
  },
  {
    icon: <FontDownloadIcon />,
    name: 'Text Answer',
    children: [
      {
        icon: <FontDownloadIcon />,
        name: 'Short Answer',
        children: [
          { name: 'Text' },
          { name: 'Password' },
          { name: 'Email' },
          { name: 'Number' },
          { name: 'Passcode' },
          { name: 'Phone' },
        ],
      },
      {
        icon: <FormatAlignLeftIcon />,
        name: 'Paragraph',
      },
      {
        icon: <CalendarMonthIcon />,
        name: 'Date Picker',
      },
    ],
  },
  {
    icon: <FormatListBulletedIcon />,
    name: 'Selection',
    children: [
      {
        icon: <RadioButtonCheckedIcon />,
        name: 'Single Choice',
      },
      {
        icon: <CheckBoxIcon />,
        name: 'Multiple Choice',
      },
      {
        icon: <FormatListBulletedIcon />,
        name: 'Dropdown',
      },
      {
        icon: <ToggleOnIcon />,
        name: 'Opt In',
      },
    ],
  },
];
