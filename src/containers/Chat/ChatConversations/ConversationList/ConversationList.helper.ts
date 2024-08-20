import { getDisplayName, getDisplayNameForSearch } from 'common/utils';

export const getConversationForSearchMulti = (
  conversation: any,
  selectedContactId: any,
  groups: boolean
) => {
  const chatType: string = groups ? 'waGroup' : 'contact';

  let entity = conversation;
  let selectedRecord = false;
  let timer;
  if (selectedContactId === entity.id) {
    selectedRecord = true;
  }
  let entityId: any;
  let displayName: string;
  let contactIsOrgRead: boolean = false;

  if (groups) {
    entityId = entity.waGroup?.id || entity.id;
  } else {
    entityId = entity.contact?.id || entity.id;
  }

  if (conversation[chatType]) {
    entity = conversation[chatType];
    if (selectedContactId === conversation[chatType]?.id) {
      selectedRecord = true;
    }
  } else if (conversation.bspStatus && conversation.lastMessageAt) {
    contactIsOrgRead = conversation.isOrgRead;
    timer = {
      time: conversation.lastMessageAt,
      contactStatus: conversation.status,
      contactBspStatus: conversation.bspStatus,
    };
  }

  displayName = getDisplayNameForSearch(entity);

  return {
    displayName,
    contactIsOrgRead,
    selectedRecord,
    entityId,
    entity,
    timer,
  };
};

export const getConversation = (
  conversation: any,
  selectedContactId: any,
  selectedCollectionId: any
) => {
  let lastMessage = [];
  if (conversation.messages && conversation.messages.length > 0) {
    [lastMessage] = conversation.messages;
  }
  let entityId: any;
  let displayName = '';
  let contactIsOrgRead = false;
  let selectedRecord = false;
  let timer;
  if (conversation.waGroup) {
    if (selectedContactId === conversation.waGroup?.id) {
      selectedRecord = true;
    }
    entityId = conversation.waGroup?.id;
    displayName = conversation.waGroup?.label;
    contactIsOrgRead = false;
  } else if (conversation.contact) {
    if (selectedContactId === conversation.contact.id) {
      selectedRecord = true;
    }
    entityId = conversation.contact.id;
    displayName = getDisplayName(conversation.contact);
    contactIsOrgRead = conversation.contact.isOrgRead;
    timer = {
      contactStatus: conversation.contact.status,
      contactBspStatus: conversation.contact.bspStatus,
      time: conversation.contact.lastMessageAt,
    };
  }

  if (conversation.group) {
    if (selectedCollectionId === conversation.group.id) {
      selectedRecord = true;
    }
    entityId = conversation.group.id;
    displayName = conversation.group.label;
    contactIsOrgRead = conversation.group.isOrgRead;
  }

  return {
    lastMessage,
    entityId,
    displayName,
    contactIsOrgRead,
    selectedRecord,
    timer,
  };
};
