interface Item {
  heading: string;
  body: JSX.Element;
  link: string;
}

export const speedSendInfo: Item = {
  heading:
    'Speed Sends is a functionality in Glific to create a message or save the messages and reuse it in future chats.',
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Speed%20Sends',
};

export const flowInfo: Item = {
  heading:
    'You can configure the flow by clicking on the configure button and the options are as follows:',
  body: (
    <ul>
      <li>Save as Draft</li>
      <li>Publish Preview</li>
      <li>Revision history</li>
      <li>Reset flow counts</li>
    </ul>
  ),
  link: 'https://glific.github.io/docs/docs/category/flows',
};

export const triggerInfo: Item = {
  heading:
    'Triggers in Glific are used to start a flow with specific contacts in a collection at a scheduled time. Triggers can be used for scheduling periodic tasks and automatically sharing them with required beneficiaries.',
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Triggers',
};

export const searchInfo: Item = {
  heading:
    'Glific provides search functionality to NGO staff to find contacts from a large set of contacts list.',
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Searches',
};

export const templateInfo: Item = {
  heading:
    "HSM (Highly Structured Message) templates are pre-approved messages by Whatsapp which are used to send to the users when their session window is closed (i.e after 24hours of inactive conversation). These templates ensure compliance with WhatsApp's guidelines and allow NGO's to send notifications, customer support messages and alerts with placeholders for personalized information.",
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Templates',
};

export const interactiveMessageInfo: Item = {
  heading:
    'Interactive Messages are used by NGOs to create engaging and dynamic conversations with their beneficiaries. This feature helps NGOs to go beyond simple text-based notifications and include interactive elements like buttons, quick replies, list menus etc. It enhances the user experience through guided interactions and helps the NGOs collect cleaner data.',
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Interactive%20Messages',
};

export const collectionInfo: Item = {
  heading:
    'Collections is a feature in Glific to keep one set of users in one place and use it to communicate with all users in that collection in one go.',
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Others/Collections',
};

export const staffManagementInfo: Item = {
  heading:
    'You can create accounts for yourself and your team to define the level of access each of your staff member has to the Glific account.',
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Others/Staff%20Management%20&%20Role%20Management',
};

export const roleInfo: Item = {
  heading:
    'Glific also allows you to create specific roles to be assigned to your staff members besides the built-in roles. This feature is disabled by default for all NGOs, but could be enabled on demand. This feature allows you to create specific roles for your staff members like Teacher, Admin, Content Creator etc.',
  body: <></>,
  link: 'https://glific.github.io/docs/docs/Product%20Features/Others/Staff%20Management%20&%20Role%20Management',
};
