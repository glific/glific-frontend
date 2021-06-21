export const responseData1 = {
  data: {
    results: [
      { key: 'settings', label: 'Settings', name: 'Settings', value_type: 'text' },
      { key: 'dob', label: 'Date of Birth', name: 'Date of Birth', value_type: 'text' },
    ],
  },
};
export const responseData = {
  data: {
    types: [
      { key_source: 'flow', name: 'flow', property_template: Array(3) },
      { key_source: 'fields', name: 'fields' },
      { key_source: 'results', name: 'results' },
      { name: 'urns', properties: Array(1) },
      { name: 'channel', properties: Array(4) },
      {
        name: 'contact',
        properties: [
          { help: 'the name or URN', key: '__default__', type: 'text' },
          { help: 'the numeric ID of the contact', key: 'id', type: 'text' },
          { help: 'the name of the contact', key: 'name', type: 'text' },
          {
            help: 'the language of the contact as 3-letter ISO code',
            key: 'language',
            type: 'text',
          },
          {
            help: 'the gender of the contact like male/female/others',
            key: 'gender',
            type: 'text',
          },
        ],
      },
    ],
  },
};
