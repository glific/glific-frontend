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
import { FILTER_TEMPLATES, GET_HSM_CATEGORIES } from 'graphql/queries/Template';
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

// Everything the page renders/locks/submits reads off this one value instead
// of recombining a pile of overlapping booleans:
//   - create      — blank form, creates a new template.
//   - copy        — prefilled from an existing template, creates a new one.
//   - view        — read-only. HSMs can't actually be edited once they exist,
//                   so /:id/edit, the dedicated /:id/view route, and
//                   previewing a sibling in place on the add route are all
//                   this same mode.
//   - addLanguage — prefilled from the anchor template, creates a new
//                   language variant.
//   - reapply     — "Edit & Re-apply" a rejected/failed variant: prefilled
//                   from that variant's own content, creates its replacement
//                   (see deleteRejectedVariantBeforeSubmit for why the old
//                   row has to go first).
type Mode = 'create' | 'view' | 'copy' | 'addLanguage' | 'reapply';

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

  const copyMessage = t('Copy of the template has been created!');

  const isViewRoute = location.pathname.endsWith('/view');
  const isCopyState = location.state === 'copy';

  const languageAnchorId = isViewRoute ? params.id : location.state?.languageAnchorId;

  const [mode, setMode] = useState<Mode>(() => {
    if (isCopyState) return 'copy';
    if (languageAnchorId) return 'view';
    if (params.id) return 'view';
    return 'create';
  });
  const updateItemQuery = mode === 'copy' ? CREATE_TEMPLATE : UPDATE_TEMPLATE;

  const isReadOnly = mode === 'view';

  const [familyVariants, setFamilyVariants] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<StatusTab>('Approved');
  const needsFamilyFetch = Boolean(languageAnchorId);
  const { data: familyFetchData } = useQuery(FILTER_TEMPLATES, {
    variables: {
      filter: { isHsm: true, shortcode: newShortcode },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
    skip: !needsFamilyFetch || !newShortcode,
  });
  useEffect(() => {
    if (needsFamilyFetch && familyFetchData?.sessionTemplates) {
      const freshVariants = familyFetchData.sessionTemplates;
      setFamilyVariants(freshVariants);
      const anchorVariant = freshVariants.find((variant: any) => variant.id === languageAnchorId);
      if (anchorVariant) {
        setActiveTab(statusTabFor(anchorVariant.status));
      }
    }
  }, [familyFetchData]);

  const variantsByTab = groupVariantsByTab(familyVariants);

  const excludeLanguageIds = useMemo(
    () => familyVariants.map((variant: any) => variant.language?.id).filter(Boolean),
    [familyVariants]
  );

  const entityId = isReadOnly ? params.id || addPagePreviewId || languageAnchorId : undefined;
  // addLanguage prefills from the anchor; reapply prefills from the rejected
  // variant itself. Fetched and pushed into state by FormLayout's own
  // getItemQuery→setStates, same mechanism copy already relies on — just
  // without entityId's update-not-create/no-fresh-media side effects, since
  // both of these always create a new row.
  const prefillId = mode === 'addLanguage' ? languageAnchorId : mode === 'reapply' ? addPagePreviewId : undefined;

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

    // addLanguage is the one mode that must NOT inherit the source's
    // language — you're picking a language that isn't taken yet, so it
    // starts blank (openAddLanguage clears it explicitly). Every other mode
    // — including switching between family members while viewing, which
    // re-runs this with a different fetched item each time — shows its own
    // real language, matched fresh against languageOptions every time.
    if (languageOptions.length > 0 && languageIdValue && mode !== 'addLanguage') {
      const selectedLanguage = languageOptions.find((lang: any) => lang.id === languageIdValue.id);
      setLanguageId(selectedLanguage || null);
    }

    if (mode !== 'copy') {
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
      isEditing: isReadOnly,
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
    setMode('reapply');
    setAddPagePreviewId(variantId);
  };

  const openAddLanguage = () => {
    setMode('addLanguage');
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
    if (!isViewRoute) {
      setMode('view');
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
      const shortcodeToMatch = created.shortcode || newShortcode;
      const { data: familyData } = await fetchFamilyVariants({
        variables: {
          filter: { isHsm: true, shortcode: shortcodeToMatch },
          opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
        },
      });
      const freshVariants = familyData?.sessionTemplates || [];
      setFamilyVariants(freshVariants);
      const createdFresh = freshVariants.find((variant: any) => variant.id === created.id);
      setActiveTab(statusTabFor(createdFresh?.status || 'PENDING'));
    } catch (error) {
      setErrorMessage(error);
    }
    setMode('view');
    setAddPagePreviewId(created.id);
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
      disabled: isReadOnly,
      onChange: getLanguageId,
    },
    {
      component: Input,
      name: 'newShortcode',
      label: `${t('Element name')}*`,
      placeholder: `${t('Element name')}`,
      // every variant of a template shares one shortcode — locked whenever
      // there's a family in play (view/addLanguage/reapply), not just view.
      disabled: isReadOnly || Boolean(languageAnchorId),
      onChange: (value: any) => setNewShortcode(value),
      helperText: t('Only lowercase alphanumeric characters and underscores are allowed.'),
    },
    {
      component: TileSelector,
      name: 'category',
      options: categoryOpn,
      variant: 'radio',
      onChange: setCategory,
      disabled: isReadOnly,
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
      disabled: isReadOnly,
      handleChange: (value: any) => setBody(value),
      defaultValue: mode !== 'create' && editorState,
    },
    {
      component: TemplateVariables,
      name: 'variables',
      message: body,
      variables,
      setVariables,
      isEditing: isReadOnly,
    },
    {
      component: Input,
      name: 'footer',
      label: `${t('Footer')} (${t('optional')})`,
      disabled: isReadOnly,
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
      disabled: isReadOnly,
      label: t('Button Type'),
    },
    {
      component: TemplateOptionsV2,
      name: 'templateButtons',
      isAddButtonChecked,
      templateType,
      inputFields: templateButtons,
      disabled: isReadOnly,
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
      disabled: isReadOnly,
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
      disabled: isReadOnly,
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
      setLanguageOptions(mode === 'addLanguage' ? filterAvailableLanguages(lang, excludeLanguageIds) : lang);
      // Adding a language means picking one that isn't taken yet — don't
      // auto-select a default (it may well be one of the excluded ones).
      // Every other non-blank mode shows its own real language instead.
      if (mode === 'create' || mode === 'copy') {
        const englishLang = lang.find((l: any) => l.label.toLowerCase() === 'english');
        setLanguageId(englishLang || lang[0]);
      }
    }
  }, [languages, mode, excludeLanguageIds]);

  const deleteRejectedVariantBeforeSubmit = async () => {
    if (mode === 'reapply' && addPagePreviewId) {
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
    if (templateType?.id && (mode === 'create' || mode === 'copy')) {
      addTemplateButtons(false);
    }
  }, [templateType]);

  useEffect(() => {
    setVariables(getVariables(body, variables));
  }, [body]);

  if (languageLoading || categoryLoading || tagLoading) {
    return <Loading />;
  }

  const languageModeTitle =
    mode === 'addLanguage' ? `${t('Add Language')} — ${newShortcode}` : newShortcode || t('HSM Template');
  const languageModeHelp =
    mode === 'addLanguage'
      ? t('Select a new language and fill in the translated content, buttons, and media for this version.')
      : t('View the content and language versions for this template.');

  return (
    <div className={styles.Page}>
      {Boolean(languageAnchorId) && (
        <Heading
          backLink={`/${backButton}`}
          formTitle={languageModeTitle}
          headerHelp={languageModeHelp}
          helpData={templateInfo}
        />
      )}
      {Boolean(languageAnchorId) && (
        <LanguageVersionsCard
          variantsByTab={variantsByTab}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showAddLanguage={!isViewRoute}
          showDelete={!isViewRoute}
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
        isView={isReadOnly}
        setStates={setStates}
        setPayload={setPayload}
        validationSchema={isReadOnly ? Yup.object() : FormSchema}
        listItemName="HSM Template"
        dialogMessage={dialogMessage}
        formFields={fields}
        redirectionLink={backButton}
        listItem="sessionTemplate"
        icon={templateIcon}
        helpData={templateInfo}
        noHeading={Boolean(languageAnchorId)}
        getLanguageId={getLanguageId}
        languageSupport={false}
        errorButtonState={{ text: isReadOnly ? t('Go Back') : t('Cancel'), show: true }}
        isAttachment
        getQueryFetchPolicy="cache-and-network"
        button={!isReadOnly ? t('Submit for Approval') : t('Save')}
        buttonState={{
          text: t('Validating URL'),
          status: validatingURL,
          show: !isReadOnly,
          styles: styles.Buttons,
        }}
        saveOnPageChange={false}
        type={mode === 'copy' ? 'copy' : undefined}
        copyNotification={copyMessage}
        backLinkButton={`/${backButton}`}
        cancelLink={backButton}
        getMediaId={getMediaId}
        entityId={entityId}
        prefillId={prefillId}
        redirect={!(mode === 'addLanguage' || mode === 'reapply')}
        afterSave={mode === 'addLanguage' || mode === 'reapply' ? handleVariantCreated : undefined}
        beforeSubmit={mode === 'reapply' ? deleteRejectedVariantBeforeSubmit : undefined}
        partialPage
        customStyles={styles.CustomFormShell}
      />

      <Simulator isPreviewMessage message={sampleMessages} simulatorIcon={false} />
    </div>
  );
};

export default HSMV2;
