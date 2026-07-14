import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Typography } from '@mui/material';
import * as Yup from 'yup';

import { BUTTON_OPTIONS } from 'common/constants';
import { templateInfo, interactiveButtonsInfo, HelpDataProps } from 'common/HelpData';
import { setNotification, setErrorMessage } from 'common/notification';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { CreateAutoComplete } from 'components/UI/Form/CreateAutoComplete/CreateAutoComplete';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { EmojiInput } from 'components/UI/Form/EmojiInput/EmojiInput';
import { Input } from 'components/UI/Form/Input/Input';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { Heading } from 'components/UI/Heading/Heading';
import Simulator from 'components/simulator/Simulator';
import { TileSelector } from 'components/UI/Form/TileSelector/TileSelector';
import { AttachmentField, AttachmentFieldChange } from 'containers/HSM/AttachmentField/AttachmentField';
import { HelpIcon } from 'components/UI/HelpIcon/HelpIcon';
import { FormLayout } from 'containers/Form/FormLayout';
import { TemplateOptionsV2 } from 'containers/TemplateOptionsV2/TemplateOptionsV2';

import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_TAGS } from 'graphql/queries/Tags';
import { FILTER_TEMPLATES, GET_HSM_CATEGORIES, GET_TEMPLATE } from 'graphql/queries/Template';
import { CREATE_MEDIA_MESSAGE } from 'graphql/mutations/Chat';
import { CREATE_TEMPLATE, UPDATE_TEMPLATE, DELETE_TEMPLATE } from 'graphql/mutations/Template';

import { languageCode } from '../HSMListV2/HSMListV2.helper';
import { TemplateVariables } from '../TemplateVariables/TemplateVariables';
import {
  convertButtonsToTemplate,
  getExampleFromBody,
  getVariables,
  getExampleValue,
  getTemplateAndButtons,
  getTemplateAndButton,
  buildTemplatePayload,
  buildTemplateButtonsList,
  buildUpdatedButtons,
  buildValidationSchema,
  CallToActionTemplate,
  QuickReplyTemplate,
  WhatsappFormTemplate,
} from '../HSM.helper';
import {
  queries,
  templateIcon,
  dialogMessage,
  categoryDescriptions,
  buildSimulatorMessage,
  filterAvailableLanguages,
  buildLanguageDraft,
  groupVariantsByTab,
  statusTabFor,
} from './HSMV2.helper';
import type { StatusTab } from './HSMV2.helper';
import { LanguageVersionsCard } from './LanguageVersionsCard/LanguageVersionsCard';
import styles from './HSMV2.module.css';

const SectionTitle = ({ title, helpData }: { title: string; helpData?: HelpDataProps }) => (
  <div className={styles.SectionTitleWrapper}>
    <Typography variant="h4" className={styles.SectionTitle}>
      {title}
      {helpData && <HelpIcon helpData={helpData} />}
    </Typography>
  </div>
);

export const HSMV2 = () => {
  const location: any = useLocation();
  const navigate = useNavigate();
  const [language, setLanguageId] = useState<any>(null);
  const [body, setBody] = useState<any>('');
  const [type, setType] = useState<any>(null);
  const [attachmentURL, setAttachmentURL] = useState<any>('');
  const [category, setCategory] = useState<any>(null);
  const [footer, setFooter] = useState('');
  const [tagId, setTagId] = useState<any>(location.state?.tag || null);
  const [variables, setVariables] = useState<any>([]);
  const [editorState, setEditorState] = useState<any>('');
  const [templateButtons, setTemplateButtons] = useState<
    Array<CallToActionTemplate | QuickReplyTemplate | WhatsappFormTemplate>
  >([]);
  const [isAddButtonChecked, setIsAddButtonChecked] = useState(false);
  const [newShortcode, setNewShortcode] = useState('');
  const [languageOptions, setLanguageOptions] = useState<any>([]);
  const [validatingURL, setValidatingURL] = useState<boolean>(false);
  const [templateType, setTemplateType] = useState<any>(BUTTON_OPTIONS[0]);
  const [languageDraftReady, setLanguageDraftReady] = useState(false);
  const [addPagePanel, setAddPagePanel] = useState<'view' | 'add' | 'edit'>('view');
  const [addPagePreviewId, setAddPagePreviewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [sampleMessages, setSampleMessages] = useState({
    type: 'TEXT',
    location: null,
    media: {},
    body: '',
    footer: '',
  });
  const { t } = useTranslation();
  const params = useParams();
  const backButton = location.state?.tag?.label
    ? `template-v2?tag=${encodeURIComponent(location.state.tag.label)}`
    : 'template-v2';

  const { data: categoryList, loading: categoryLoading } = useQuery(GET_HSM_CATEGORIES);

  const { data: tag, loading: tagLoading } = useQuery(GET_TAGS, {
    variables: {},
    fetchPolicy: 'network-only',
  });

  const { data: languages, loading: languageLoading } = useQuery(USER_LANGUAGES, {
    variables: { opts: { order: 'ASC' } },
  });
  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE);
  const [deleteTemplate, { loading: deleteLoading }] = useMutation(DELETE_TEMPLATE);
  const [fetchFamilyVariants] = useLazyQuery(FILTER_TEMPLATES, { fetchPolicy: 'network-only' });

  let mode;
  const copyMessage = t('Copy of the template has been created!');

  const isCopyState = location.state === 'copy';
  const updateItemQuery = isCopyState ? CREATE_TEMPLATE : UPDATE_TEMPLATE;
  if (isCopyState) {
    mode = 'copy';
  }

  const isViewRoute = location.pathname.endsWith('/view');
  const isEditing = Boolean(params.id && !isCopyState && !isViewRoute);
  const languageAnchorId = isViewRoute ? params.id : location.state?.languageAnchorId;

  const excludeLanguageIds = useMemo(() => location.state?.excludeLanguageIds || [], [location.state]);
  // local state (not a plain derived const) so deleting a variant from the
  // Language versions card can drop it from the list immediately, without a
  // refetch/renavigation.
  const [familyVariants, setFamilyVariants] = useState<any[]>(location.state?.variants || []);
  const isLanguageMode = Boolean(languageAnchorId) && !isEditing && !isCopyState;
  const isAddRoute = isLanguageMode && !isViewRoute;
  const isAddingLanguage = isAddRoute && addPagePanel === 'add';
  const isViewingVariant = (isLanguageMode && isViewRoute) || (isAddRoute && addPagePanel === 'view');
  const isEditingVariant = isAddRoute && addPagePanel === 'edit';
  const fieldsLocked = isEditing || isViewingVariant;

  const [activeTab, setActiveTab] = useState<StatusTab>(() => {
    const initialVariant = familyVariants.find((variant: any) => variant.id === languageAnchorId);
    return initialVariant ? statusTabFor(initialVariant.status) : 'Approved';
  });

  const { data: languageAnchorData, loading: languageAnchorLoading } = useQuery(GET_TEMPLATE, {
    variables: { id: languageAnchorId },
    skip: !isLanguageMode,
  });
  const languageAnchor = languageAnchorData?.sessionTemplate?.sessionTemplate;

  const variantsByTab = groupVariantsByTab(familyVariants);

  const { data: previewData } = useQuery(GET_TEMPLATE, {
    variables: { id: addPagePreviewId },
    skip: !(isAddRoute && (addPagePanel === 'view' || addPagePanel === 'edit') && addPagePreviewId),
  });
  const viewingLanguage =
    isAddRoute && (addPagePanel === 'view' || addPagePanel === 'edit') && addPagePreviewId
      ? previewData?.sessionTemplate?.sessionTemplate?.language
      : languageAnchor?.language;
  useEffect(() => {
    if (isViewingVariant || isEditingVariant) {
      if (viewingLanguage && languageOptions.length > 0) {
        const matched = languageOptions.find((option: any) => option.id === viewingLanguage.id);
        setLanguageId(matched || null);
      } else {
        setLanguageId(null);
      }
    }
  }, [isViewingVariant, isEditingVariant, viewingLanguage, languageOptions]);

  // "Edit & Re-apply" deliberately leaves entityId unset, same as "Add new
  // language" — FormLayout treats a missing entityId as create-not-update, so
  // Save submits a new template (the rejected one is a separate row you
  // delete yourself) instead of overwriting the rejected record in place.
  const entityId = isEditing
    ? params.id
    : isLanguageMode && isViewRoute
      ? languageAnchorId
      : isAddRoute && addPagePanel === 'view'
        ? addPagePreviewId || languageAnchorId
        : undefined;

  const categoryOpn: any = [];
  if (categoryList) {
    categoryList.whatsappHsmCategories.forEach((categories: any) => {
      categoryOpn.push({ label: categories, id: categories, description: categoryDescriptions[categories] });
    });
  }

  const states = {
    language,
    body,
    footer,
    type,
    attachmentURL,
    category,
    tagId,
    templateButtons,
    templateType,
    isAddButtonChecked,
    variables,
    newShortcode,
  };

  const getLanguageId = (value: any) => {
    if (!value.label) {
      return;
    }
    const selected = languageOptions.find((option: any) => option.label === value.label);
    setLanguageId(selected);
  };

  const handleDynamicParamsChange = (value: any, index: number) => {
    setTemplateButtons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...value };
      return updated;
    });
  };

  const setStates = ({
    language: languageIdValue,
    body: bodyValue,
    footer: footerValue,
    example: exampleValue,
    type: typeValue,
    MessageMedia: MessageMediaValue,
    shortcode: shortcodeValue,
    category: categoryValue,
    tag: tagIdValue,
    buttonType: templateButtonType,
    buttons,
    hasButtons,
  }: any) => {
    let vars: any = [];

    if (languageOptions.length > 0 && languageIdValue && !isViewingVariant && !isEditingVariant) {
      if (!language?.id) {
        const selectedLanguage = languageOptions.find((lang: any) => lang.id === languageIdValue.id);
        setLanguageId(selectedLanguage);
      } else {
        setLanguageId(language);
      }
    }

    if (!isCopyState) {
      setNewShortcode(shortcodeValue);
    }

    setBody(bodyValue);
    setFooter(footerValue || '');
    setEditorState(bodyValue);
    setCategory(
      categoryValue
        ? { id: categoryValue, label: categoryValue, description: categoryDescriptions[categoryValue] }
        : null
    );
    setTagId(tagIdValue);
    vars = getExampleValue(exampleValue);
    setVariables(vars);

    if (hasButtons) {
      const { buttons: buttonsVal } = getTemplateAndButtons(templateButtonType, exampleValue, buttons);
      setTemplateButtons(buttonsVal);
      setTemplateType(BUTTON_OPTIONS.find((btn: any) => btn.id === templateButtonType));
      setIsAddButtonChecked(hasButtons);
    }

    if (typeValue && typeValue !== 'TEXT') {
      setType({ id: typeValue, label: typeValue });
    } else {
      setType(null);
    }

    if (MessageMediaValue) {
      setAttachmentURL(MessageMediaValue.sourceUrl);
    } else {
      setAttachmentURL('');
    }
  };

  const setPayload = (payload: any) =>
    buildTemplatePayload(payload, {
      isEditing,
      category,
      variables,
      isAddButtonChecked,
      templateType,
      templateButtons,
      body,
      footer,
      tagId,
    });

  const handleAttachmentChange = (patch: AttachmentFieldChange) => {
    if ('type' in patch) {
      setType(patch.type);
    }
    if ('attachmentURL' in patch) {
      setAttachmentURL(patch.attachmentURL);
    }
    if ('validatingURL' in patch) {
      setValidatingURL(patch.validatingURL!);
    }
  };

  const addTemplateButtons = (addFromTemplate: boolean = true) => {
    setTemplateButtons(buildTemplateButtonsList(templateButtons, templateType, addFromTemplate));
  };

  const removeTemplateButtons = (index: number) => {
    setTemplateButtons(templateButtons.filter((_val, idx) => idx !== index));
  };

  const handleInputChange = (value: any, row: any, index: any, eventType: any) => {
    setTemplateButtons(buildUpdatedButtons(templateButtons, value, row, index, eventType));
  };

  const handleTemplateTypeChange = (value: any) => {
    if (value) {
      setTemplateButtons(buildTemplateButtonsList([], value, false));
      setTemplateType(value);
      setIsAddButtonChecked(true);
    }
  };

  const clearButtonSelection = () => {
    setIsAddButtonChecked(false);
  };

  const getMediaId = async (payload: any) =>
    createMediaMessage({
      variables: {
        input: {
          caption: payload.body,
          sourceUrl: payload.attachmentURL,
          url: payload.attachmentURL,
        },
      },
    });

  const setSimulatorMessage = (messages: any, footerValue?: any) => {
    setSampleMessages((prev) =>
      buildSimulatorMessage({ sampleMessages: prev, body, variables, attachmentURL, type }, messages, footerValue)
    );
  };

  const requestDeleteVariant = (variantId: string) => {
    const variant = familyVariants.find((familyVariant: any) => familyVariant.id === variantId);
    const label = variant ? `${variant.language?.label} (${languageCode(variant.language?.locale)})` : variantId;
    setDeleteTarget({ id: variantId, label });
  };

  const confirmDeleteVariant = async () => {
    if (!deleteTarget) {
      return;
    }
    const { id } = deleteTarget;
    try {
      await deleteTemplate({ variables: { id } });
      setNotification(t('Template deleted successfully'));
      // the anchor is what this whole page is built from (draft prefill, page
      // title, entityId) — deleting it leaves nothing sensible to keep showing.
      if (id === languageAnchorId) {
        navigate(`/${backButton}`);
        return;
      }
      setFamilyVariants((prev) => prev.filter((variant) => variant.id !== id));
      // if the deleted row was the one being previewed, fall back to the
      // anchor's own content instead of pointing at a variant that's gone.
      if (addPagePreviewId === id) {
        setAddPagePreviewId(null);
      }
    } catch (error) {
      setErrorMessage(error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEditReapply = (variantId: string) => {
    setAddPagePanel('edit');
    setAddPagePreviewId(variantId);
  };

  const openAddLanguage = () => {
    setAddPagePanel('add');
    setAddPagePreviewId(null);
    // otherwise the anchor's own language (shown while previewing it above)
    // stays selected — picking a language you're translating into should
    // start blank, not preloaded with one that's already taken.
    setLanguageId(null);
  };

  const viewVariant = (variantId: string) => {
    // on the add route, "View" previews a variant in place (same URL) — the
    // list page's own View icon is the only thing that goes to the
    // dedicated /:id/view route.
    if (isAddRoute) {
      setAddPagePanel('view');
      setAddPagePreviewId(variantId);
    } else {
      navigate(`/template-v2/${variantId}/view`, { state: { variants: familyVariants } });
    }
  };

  const handleVariantCreated = async (data: any) => {
    const created = data?.createSessionTemplate?.sessionTemplate;
    if (!created) {
      return;
    }
    try {
      const { data: familyData } = await fetchFamilyVariants({
        variables: {
          filter: { isHsm: true, status: '' },
          opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
        },
      });
      const shortcodeToMatch = created.shortcode || newShortcode;
      const freshVariants = (familyData?.sessionTemplates || []).filter(
        (item: any) => item.shortcode === shortcodeToMatch
      );
      setFamilyVariants(freshVariants);
      const createdFresh = freshVariants.find((variant: any) => variant.id === created.id);
      setActiveTab(statusTabFor(createdFresh?.status || 'PENDING'));
    } catch (error) {
      setErrorMessage(error);
    }
    setAddPagePanel('view');
    setAddPagePreviewId(created.id);
    setLanguageDraftReady(false);
  };

  const fields = [
    {
      component: SectionTitle,
      name: '__sectionTemplateDetails',
      title: t('Template Details'),
    },
    {
      component: AutoComplete,
      name: 'language',
      label: `${t('Language')}*`,
      options: languageOptions,
      optionLabel: 'label',
      multiple: false,
      disabled: fieldsLocked,
      onChange: getLanguageId,
    },
    {
      component: Input,
      name: 'newShortcode',
      label: `${t('Element name')}*`,
      placeholder: `${t('Element name')}`,
      disabled: isEditing || isLanguageMode,
      onChange: (value: any) => setNewShortcode(value),
      helperText: t('Only lowercase alphanumeric characters and underscores are allowed.'),
    },
    {
      component: TileSelector,
      name: 'category',
      options: categoryOpn,
      variant: 'radio',
      onChange: setCategory,
      disabled: fieldsLocked,
      label: t('Category'),
    },
    {
      component: SectionTitle,
      name: '__sectionMessageContent',
      title: t('Message Content'),
    },
    {
      component: EmojiInput,
      name: 'body',
      label: `${t('Message')}*`,
      rows: 5,
      disabled: fieldsLocked,
      handleChange: (value: any) => setBody(value),
      defaultValue: (fieldsLocked || isCopyState || isAddingLanguage || isEditingVariant) && editorState,
    },
    {
      component: TemplateVariables,
      name: 'variables',
      message: body,
      variables,
      setVariables,
      isEditing: fieldsLocked,
    },
    {
      component: Input,
      name: 'footer',
      label: `${t('Footer')} (${t('optional')})`,
      disabled: fieldsLocked,
      inputProp: {
        onChange: (event: any) => setFooter(event.target.value),
      },
    },
    {
      component: SectionTitle,
      name: '__sectionInteractiveButtons',
      title: t('Interactive Buttons'),
      helpData: interactiveButtonsInfo,
    },
    {
      component: TileSelector,
      name: 'templateType',
      options: BUTTON_OPTIONS,
      selected: isAddButtonChecked,
      onChange: handleTemplateTypeChange,
      onClear: clearButtonSelection,
      clearLabel: t('Clear button selection'),
      disabled: fieldsLocked,
      label: t('Button Type'),
    },
    {
      component: TemplateOptionsV2,
      name: 'templateButtons',
      isAddButtonChecked,
      templateType,
      inputFields: templateButtons,
      disabled: fieldsLocked,
      onAddClick: addTemplateButtons,
      onRemoveClick: removeTemplateButtons,
      onInputChange: handleInputChange,
      onDynamicParamsChange: handleDynamicParamsChange,
    },
    {
      component: SectionTitle,
      name: '__sectionMediaAttachment',
      title: t('Media Attachment'),
    },
    {
      component: AttachmentField,
      name: 'type',
      onChange: handleAttachmentChange,
      disabled: fieldsLocked,
      label: t('Attachment Type'),
    },
    {
      component: SectionTitle,
      name: '__sectionOrganizationTags',
      title: t('Organization & Tags'),
    },
    {
      component: CreateAutoComplete,
      name: 'tagId',
      label: `${t('Tag')} (${t('optional')})`,
      options: tag ? tag.tags : [],
      optionLabel: 'label',
      disabled: fieldsLocked,
      hasCreateOption: true,
      multiple: false,
      onChange: (value: any) => setTagId(value),
      placeholder: t('Search or create a tag...'),
      helperText: t('Pick a suggestion or type your own — tags help you filter and organise templates later.'),
    },
  ];

  const FormSchema = buildValidationSchema({ t, isAddButtonChecked, templateType });

  useEffect(() => {
    if (languages) {
      const lang = languages.currentUser.user.organization.activeLanguages.slice();
      lang.sort((first: any, second: any) => (first.label > second.label ? 1 : -1));
      setLanguageOptions(isAddingLanguage ? filterAvailableLanguages(lang, excludeLanguageIds) : lang);
      // Adding a language means picking one that isn't taken yet — don't
      // auto-select a default (it may well be one of the excluded ones).
      if (!isEditing && !isAddingLanguage && !isViewingVariant && !isEditingVariant) {
        const englishLang = lang.find((l: any) => l.label.toLowerCase() === 'english');
        setLanguageId(englishLang || lang[0]);
      }
    }
  }, [languages, isAddingLanguage, excludeLanguageIds, isEditing, isViewingVariant, isEditingVariant]);

  const languageDraftSource = isEditingVariant ? previewData?.sessionTemplate?.sessionTemplate : languageAnchor;
  useEffect(() => {
    if ((isAddingLanguage || isEditingVariant) && languageDraftSource && !languageDraftReady) {
      const draft = buildLanguageDraft(languageDraftSource);
      setNewShortcode(draft.newShortcode);
      setBody(draft.body);
      setEditorState(draft.body);
      setFooter(draft.footer);
      setCategory(draft.category);
      setVariables(draft.variables);
      setType(draft.type);
      setAttachmentURL(draft.attachmentURL);
      setTemplateType(draft.templateType);
      setTemplateButtons(draft.templateButtons);
      setIsAddButtonChecked(draft.isAddButtonChecked);
      setTagId(draft.tagId);
      setLanguageDraftReady(true);
    }
  }, [isAddingLanguage, isEditingVariant, languageDraftSource, languageDraftReady]);

  const deleteRejectedVariantBeforeSubmit = async () => {
    if (isEditingVariant && addPagePreviewId) {
      await deleteTemplate({ variables: { id: addPagePreviewId } });
    }
  };

  const computeSampleText = () => {
    const { message }: any = getTemplateAndButton(getExampleFromBody(body, variables));

    if (!isAddButtonChecked || templateButtons.length === 0) {
      return message || '';
    }

    const parse = convertButtonsToTemplate(templateButtons, templateType?.id);
    const parsedText = parse.length ? `| ${parse.join(' | ')}` : '';
    return parsedText ? (message || ' ') + parsedText : message || '';
  };

  useEffect(() => {
    setSimulatorMessage(computeSampleText(), footer);
  }, [body, variables, footer, templateButtons, templateType, isAddButtonChecked, type, attachmentURL]);

  useEffect(() => {
    if (templateType?.id && !isEditing && !isAddingLanguage && !isViewingVariant && !isEditingVariant) {
      addTemplateButtons(false);
    }
  }, [templateType]);

  useEffect(() => {
    setVariables(getVariables(body, variables));
  }, [body]);

  if (
    languageLoading ||
    categoryLoading ||
    tagLoading ||
    (isLanguageMode && languageAnchorLoading && !languageAnchor)
  ) {
    return <Loading />;
  }

  const languageModeTitle = isAddingLanguage
    ? `${t('Add Language')} — ${languageAnchor?.shortcode}`
    : languageAnchor?.shortcode || t('HSM Template');
  const languageModeHelp = isAddingLanguage
    ? t('Select a new language and fill in the translated content, buttons, and media for this version.')
    : t('View the content and language versions for this template.');

  return (
    <div className={styles.Page}>
      {isLanguageMode && (
        <Heading
          backLink={`/${backButton}`}
          formTitle={languageModeTitle}
          headerHelp={languageModeHelp}
          helpData={templateInfo}
        />
      )}
      {isLanguageMode && (
        <LanguageVersionsCard
          variantsByTab={variantsByTab}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showAddLanguage={isAddRoute}
          showDelete={isAddRoute}
          onView={viewVariant}
          onEditReapply={openEditReapply}
          onAddLanguage={openAddLanguage}
          onDelete={requestDeleteVariant}
        />
      )}
      {deleteTarget && (
        <DialogBox
          title={`${t('Are you sure you want to delete the')} "${deleteTarget.label}" ${t('version?')}`}
          handleCancel={() => setDeleteTarget(null)}
          handleOk={confirmDeleteVariant}
          colorOk="warning"
          buttonOkLoading={deleteLoading}
        >
          {t('This action cannot be undone.')}
        </DialogBox>
      )}
      <FormLayout
        {...queries}
        updateItemQuery={updateItemQuery}
        states={states}
        isView={fieldsLocked}
        setStates={setStates}
        setPayload={setPayload}
        validationSchema={fieldsLocked ? Yup.object() : FormSchema}
        listItemName="HSM Template"
        dialogMessage={dialogMessage}
        formFields={fields}
        redirectionLink={backButton}
        listItem="sessionTemplate"
        icon={templateIcon}
        helpData={templateInfo}
        noHeading={isLanguageMode}
        getLanguageId={getLanguageId}
        languageSupport={false}
        errorButtonState={{ text: fieldsLocked ? t('Go Back') : t('Cancel'), show: true }}
        isAttachment
        getQueryFetchPolicy="cache-and-network"
        button={!fieldsLocked ? t('Submit for Approval') : t('Save')}
        buttonState={{
          text: t('Validating URL'),
          status: validatingURL,
          show: !fieldsLocked,
          styles: styles.Buttons,
        }}
        saveOnPageChange={false}
        type={mode}
        copyNotification={copyMessage}
        backLinkButton={`/${backButton}`}
        cancelLink={backButton}
        getMediaId={getMediaId}
        entityId={entityId}
        redirect={!(isAddingLanguage || isEditingVariant)}
        afterSave={isAddingLanguage || isEditingVariant ? handleVariantCreated : undefined}
        beforeSubmit={isEditingVariant ? deleteRejectedVariantBeforeSubmit : undefined}
        partialPage
        customStyles={styles.CustomFormShell}
      />

      <Simulator isPreviewMessage message={sampleMessages} simulatorIcon={false} />
    </div>
  );
};

export default HSMV2;
