export interface HelpDataProps {
  heading: string;
  link: string;
}

export const speedSendInfo: HelpDataProps = {
  heading:
    'Speed Sends is a functionality in Glific to create a message or save the messages and reuse it in future chats.',

  link: 'https://glific.github.io/docs/docs/Product%20Features/Speed%20Sends',
};

export const flowInfo: HelpDataProps = {
  heading:
    'Flows are the heart of your Glific chatbot. Design engaging conversational experiences using message blocks, decision nodes, external service calls, and more.',
  link: 'https://glific.github.io/docs/docs/category/flows',
};

export const triggerInfo: HelpDataProps = {
  heading:
    'Triggers in Glific are used to start a flow with specific contacts in a collection at a scheduled time. Triggers can be used for scheduling periodic tasks and automatically sharing them with required beneficiaries.',

  link: 'https://glific.github.io/docs/docs/Product%20Features/Triggers',
};

export const searchInfo: HelpDataProps = {
  heading:
    'Glific provides search functionality to NGO staff to find contacts from a large set of contacts list.',

  link: 'https://glific.github.io/docs/docs/Product%20Features/Searches',
};

export const templateInfo: HelpDataProps = {
  heading:
    "HSM (Highly Structured Message) templates are pre-approved messages by Whatsapp which are used to send to the users when their session window is closed (i.e after 24hours of inactive conversation). These templates ensure compliance with WhatsApp's guidelines and allow NGO's to send notifications, customer support messages and alerts with placeholders for personalized information.",

  link: 'https://glific.github.io/docs/docs/Product%20Features/Templates',
};

export const interactiveMessageInfo: HelpDataProps = {
  heading:
    'Interactive Messages are used by NGOs to create engaging and dynamic conversations with their beneficiaries. This feature helps NGOs to go beyond simple text-based notifications and include interactive elements like buttons, quick replies, list menus etc. It enhances the user experience through guided interactions and helps the NGOs collect cleaner data.',

  link: 'https://glific.github.io/docs/docs/Product%20Features/Interactive%20Messages',
};

export const collectionInfo: HelpDataProps = {
  heading:
    'Collections is a feature in Glific to keep one set of users in one place and use it to communicate with all users in that collection in one go.',

  link: 'https://glific.github.io/docs/docs/Product%20Features/Others/Collections',
};

export const staffManagementInfo: HelpDataProps = {
  heading:
    'You can create accounts for yourself and your team to define the level of access each of your staff member has to the Glific account.',
  link: 'https://glific.github.io/docs/docs/Product%20Features/Others/Staff%20Management%20&%20Role%20Management',
};

export const roleInfo: HelpDataProps = {
  heading:
    'Glific also allows you to create specific roles to be assigned to your staff members besides the built-in roles. This feature is disabled by default for all NGOs, but could be enabled on demand. This feature allows you to create specific roles for your staff members like Teacher, Admin, Content Creator etc.',

  link: 'https://glific.github.io/docs/docs/Product%20Features/Others/Staff%20Management%20&%20Role%20Management',
};

// current

export const googleSheetsInfo: HelpDataProps = {
  heading:
    'Glific allows you to connect flows to Google Sheets, enabling seamless data transfer between the two platforms.',
  link: 'https://glific.github.io/docs/docs/Product%20Features/Flows/Flow%20Actions/Link%20Google%20Sheets/', // Replace with the actual Glific documentation link
};

export const webhookLogsInfo: HelpDataProps = {
  heading:
    'Webhook Logs provide a detailed record of all incoming and outgoing webhook events within your Glific flows.',
  link: 'https://glific.github.io/docs/docs/Product%20Features/Flows/Flow%20Actions/Call%20a%20webhook/#checking-webhook-logs', // Replace with the actual Glific documentation link
};

export const contactVariablesInfo: HelpDataProps = {
  heading:
    'Contact Variables enable you to store and personalize information associated with individual beneficiaries in your Glific chatbot.',
  link: 'https://glific.github.io/docs/docs/Product%20Features/Flows/Flow%20Variables/Flow%20variables%20vs%20Contact%20variables', // Replace with the actual Glific documentation link
};

export const ticketsInfo: HelpDataProps = {
  heading:
    "Glific's ticketing system allows you to manage support requests, issues, or tasks efficiently. Track, prioritize, and resolve tickets, ensuring seamless communication within your team.",
  link: 'https://glific.github.io/docs/docs/Product%20Features/Flows/Flow%20Actions/Open%20a%20ticket%20with%20a%20human%20agent/', // Replace with the actual Glific documentation link
};

export const contactManagementInfo: HelpDataProps = {
  heading:
    'Glific offers flexible contact management tools, including the ability to organize contacts into collections and update contact information.',
  link: 'https://glific.github.io/docs/docs/FAQ/Update%20collection%20with%20bulk%20contacts%20or%20contact%20fields/', // Replace with the actual Glific documentation link
};

export const blockedContactsInfo: HelpDataProps = {
  heading:
    'Glific allows you to block contacts who are sending unwanted or inappropriate messages, ensuring a positive experience for both your beneficiaries and staff.',
  link: 'https://glific.github.io/docs/docs/Product%20Features/Others/All%20product%20features/#block-contacts', // Replace with the actual Glific documentation link
};
