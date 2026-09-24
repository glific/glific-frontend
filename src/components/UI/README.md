# components/UI catalog

Every reusable component that lives under `src/components/UI/**`, what it's for, and when
_not_ to reach for it. This exists because the #1 reason UI gets rebuilt from scratch is
that nobody could find the thing that already does it — check here first.

Three project agents read this file — `.claude/agents/planner.md` when deciding what a feature
should be assembled from, `.claude/agents/engineer.md` before writing UI code, and
`.claude/agents/reviewer.md` when checking a diff for reinvention. Keep it current when you add,
remove, or repurpose a component.

**Not catalogued here:** `src/containers/List/List.tsx` and
`src/containers/Form/FormLayout.tsx` — these are page-level CRUD patterns documented in the
root `CLAUDE.md`, not `components/UI` primitives. If you're building a list page or a
create/edit form, start there, not here. Note also that there is **no** `Form.tsx` wrapper
directly under `components/UI` — `src/components/UI/Form/` is a directory of individual
field components (below); it isn't itself a component.

## Quick lookup: "I have a design/HTML shape, what do I use?"

| You see...                                        | Use                                                         |
| ------------------------------------------------- | ----------------------------------------------------------- |
| Modal, confirmation popup, form-in-a-dialog       | `DialogBox`                                                 |
| "Pick from a searchable list" modal               | `SearchDialogBox`                                           |
| Read-only table of rows already in hand           | `DataTable`                                                 |
| "Nothing here yet" card with a next step          | `EmptyState`                                                |
| Two or three mutually exclusive inline choices    | `SegmentedControl`                                          |
| Full-page or full-section loading state           | `Layout/Loading`                                            |
| Full-page error state                             | `ErrorPage`                                                 |
| Any button                                        | `Form/Button`                                               |
| Icon-only button (copy, edit, close…)             | `IconButton`                                                |
| Any text/password/OTP/textarea field              | `Form/Input`                                                |
| Single/multi-select with search                   | `Form/AutoComplete`                                         |
| Simple single-select dropdown                     | `Form/Dropdown`                                             |
| Boolean checkbox field                            | `Form/Checkbox`                                             |
| Numeric value on a bounded scale                  | `Form/RangeSlider`                                          |
| Phone number field                                | `Form/PhoneInput`                                           |
| Date / time / date+time field                     | `Form/Calendar` / `Form/TimePicker` / `Form/DateTimePicker` |
| Tooltip                                           | `Tooltip`                                                   |
| Search bar (with optional advanced-filter toggle) | `SearchBar`                                                 |
| CSV bulk-upload                                   | `CsvUpload`                                                 |
| Generic (non-CSV) file import                     | `ImportButton`                                              |
| Person avatar (initials)                          | `AvatarDisplay`                                             |
| "Beta" label                                      | `BetaTag`                                                   |
| Click/hover dropdown action menu                  | `Menu`                                                      |

If nothing here fits, that's a real gap — raise it instead of building it inline in a
feature file.

---

## Dialogs & overlays

| Component         | Purpose                                                                                  | Key props                                                                                                                                  | Used in               | Notes                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `DialogBox`       | Standard modal — title, content, configurable Cancel/Middle/OK buttons                   | `open`, `title`, `handleOk`, `handleCancel`, `handleMiddle`, `buttonOk`/`buttonCancel` labels, `disableOk`, `buttonOkLoading`, `fullWidth` | **50 files**          | The canonical dialog wrapper. Don't use raw MUI `Dialog`.                                                         |
| `SearchDialogBox` | `DialogBox` pre-composed with an `AutoComplete` for picking items from a searchable list | `title`, `options`, `selectedOptions`, `multiple`, `asyncSearch`                                                                           | 3 files               | Built on `DialogBox` + `AutoComplete` — don't recompose those two by hand for this pattern.                       |
| `Menu`            | Popper-based dropdown/context menu, click or hover triggered                             | `menus`, `eventType`, `placement`, `children`                                                                                              | 3 files               | Don't build raw MUI `Popper`+`MenuList` for this.                                                                 |
| `Menu/MenuItem`   | Single menu row, optionally a router `Link`                                              | `title`, `path`, `icon`                                                                                                                    | internal to `Menu`    | Not for standalone use.                                                                                           |
| `MessageDialog`   | Modal wrapping the chat composer (`ChatInput`)                                           | `title`, `onSendMessage`                                                                                                                   | **0 consumers**       | **Dead code** — confirm with the team before deleting; may be a leftover from a feature that shipped differently. |
| `TrialVideoModal` | One-time welcome-video modal for new trial users                                         | `sessionData`                                                                                                                              | 1 file (`Layout.tsx`) | Already wired app-wide via `Layout`; not for reuse elsewhere.                                                     |

## Loading, error & status

| Component        | Purpose                                                           | Key props                                   | Used in                 | Notes                                                                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Layout/Loading` | Centered spinner + message, optional rotating "pro tip"           | `message`, `showTip`, `whiteBackground`     | **37 files**            | The standard loader — don't wrap raw `CircularProgress`.                                                                                                                              |
| `DotLoader`      | Small inline animated dot/spinner                                 | none                                        | 1 file (chat)           | For inline "sending/typing" indicators only; use `Loading` for section-level states.                                                                                                  |
| `ErrorPage`      | Full-page error state with Refresh action                         | `title`, `onRefresh`                        | 2 files                 | Route/boundary-level only, not inline field errors.                                                                                                                                   |
| `EmptyState`     | Card for a screen with nothing to show: icon, title, note, action | `title`, `note`, `icon`, `action`, `testId` | 2 files (AI Evaluation) | Use for "nothing here yet" and for blocked states with a next step. Not for inline field errors or full-page failures (`ErrorPage`).                                                  |
| `ToastMessage`   | Snackbar+Alert toast                                              | `open`, `severity`, `message`               | 2 files                 | **Prefer `setNotification`/`setErrorMessage`** (see root `CLAUDE.md`) over using this directly — toasts should go through the Apollo-cache notification service, not component state. |
| `Timer`          | WhatsApp 24-hour session-window countdown, or opt-out indicator   | `time`, `contactStatus`, `variant`          | 3 files                 | Domain-specific to WhatsApp session windows, not a generic timer.                                                                                                                     |

## Data display

| Component          | Purpose                                                           | Key props                                                          | Used in                 | Notes                                                                                                          |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `DataTable`        | Scrollable table with a sticky header, for rows already in memory | `columns`, `rows`, `maxHeight`, `className`, `testId`, `rowTestId` | 1 file (AI Evaluation)  | For data you already hold. Query-driven, paginated list pages belong in `containers/List` instead.             |
| `SegmentedControl` | Pill track of two or three mutually exclusive options             | `options`, `value`, `onChange`, `label`, `optionClassName`         | 2 files (AI Evaluation) | Style per-usage through `optionClassName`/`trackClassName` — don't edit the component's own CSS, it is shared. |

## Page structure

| Component             | Purpose                                                                          | Key props                                                   | Used in            | Notes                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Heading`             | Page/section header: title, back-link, help icon, subtext, primary action button | `formTitle`, `helpData`, `backLink`, `button`               | 10 files           | Use instead of hand-building headers from raw `Typography`+`Button`.                                                                         |
| `HelpIcon`            | Info icon with heading + "Learn more" tooltip                                    | `helpData`                                                  | 7 files            | Coupled to the `HelpData` shape in `common/HelpData`.                                                                                        |
| `Tooltip`             | Styled wrapper around MUI `Tooltip`                                              | `title`, `placement`, `tooltipClass`                        | 16 files           | Don't use raw MUI `Tooltip` in feature code.                                                                                                 |
| `SearchBar`           | Search input with clear button and optional advanced-filter adornment            | `searchVal`, `handleChange`, `handleSubmit`, `endAdornment` | 5 files            | Don't build raw MUI `InputBase` search fields.                                                                                               |
| `IconButton`          | Icon-only button — pass-through wrapper over MUI `IconButton`                    | all MUI `IconButton` props (`size`, `onClick`, `disabled`)  | 1 file             | Use instead of importing MUI's directly; `@mui/material` is banned in `src/containers/**`. For a button with a text label use `Form/Button`. |
| `BetaTag`             | "Beta"/custom label pill                                                         | `label`, `size`                                             | 3 files            | Trivial, low risk.                                                                                                                           |
| `AvatarDisplay`       | Circular initials avatar with optional status badge                              | `name`, `type`, `badgeDisplay`                              | 3 files            |                                                                                                                                              |
| `ListIcon`            | Maps an icon-name string to one of ~30 known nav/section SVG icons               | `icon`, `selected`, `count`                                 | 2 files (nav only) | Not a general icon component — only for known nav-icon keys. The broader icon set has no registry yet — a real gap.                          |
| `SourceReferenceChip` | "language: value" citation chip                                                  | `language`, `value`                                         | 2 files            | Narrow use case (AI/knowledge-source citations).                                                                                             |
| `LanguageBar`         | Row of language-selection tabs                                                   | `options`, `selectedLangauge`, `onLanguageChange`           | 2 files            | Niche — multi-language content editing (templates/HSM).                                                                                      |

## Upload & import

| Component      | Purpose                                                                            | Key props                               | Used in | Notes                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------- | --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `CsvUpload`    | Button-styled file picker that reads a `.csv` as text, plus a sample-download link | `fileName`, `onFileSelect`, `sampleUrl` | 2 files | CSV-only (hard extension check) — non-CSV file flows have no shared upload component/hook yet (see Known gaps below). |
| `ImportButton` | Hidden file input triggered by a styled button, reads any file as text             | `title`, `onImport`, `fileType`         | 5 files | For generic (non-CSV) file import, e.g. flow import.                                                                  |
| `EmojiPicker`  | Thin wrapper around `@emoji-mart/react`                                            | `displayStyle`, `onEmojiSelect`         | 3 files | Consumed by `Form/EmojiInput`; not meant to be used standalone.                                                       |

## App shell (not for feature reuse)

| Component                      | Purpose                                                                     | Used in                  | Notes                                                        |
| ------------------------------ | --------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| `Layout`                       | Authenticated-app shell: drawer + header + content area + `TrialVideoModal` | 1 file (router)          | Mounted once by the router — never import from feature code. |
| `Layout/Navigation/SideDrawer` | Left nav drawer: logo, wallet balance, menu, trial banner, user menu        | internal to `Layout`     | Not composable elsewhere.                                    |
| `Layout/Navigation/SideMenus`  | Renders nav items from the role-based menu config                           | internal to `SideDrawer` | Driven by `context/role.ts`; not standalone.                 |

---

## Form fields (`components/UI/Form/**`)

All Formik-integrated unless noted.

| Component            | Purpose                                                                                           | Key props                                                               | Used in      | Notes                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `Button`             | MUI `Button` wrapper with a built-in `loading` state                                              | `loading`, `disabled`, plus all MUI `ButtonProps`                       | **47 files** | Use for every button — needed for the app-wide loading-state pattern.                                         |
| `Input`              | MUI `OutlinedInput` wrapper: text/password/OTP/textarea, emoji slot, translation label, dark mode | `type`, `textArea`, `togglePassword`, `emojiPicker`, `customFieldError` | **43 files** | The standard text field.                                                                                      |
| `AutoComplete`       | MUI `Autocomplete` wrapper: multi/single, async search, chips, "create new option," free-solo     | `options`, `multiple`, `freeSolo`, `asyncSearch`, `hasCreateOption`     | **32 files** | Feature-rich enough to cover almost every select/search need.                                                 |
| `Checkbox`           | Checkbox with label + optional info tooltip/dialog                                                | `title`, `info`, `infoType`                                             | 14 files     |                                                                                                               |
| `PhoneInput`         | Phone number field (country search, defaults to India)                                            | `enableSearch`, `changeHandler`                                         | 7 files      |                                                                                                               |
| `Dropdown`           | Simple MUI `Select`                                                                               | `options`, `helperText`                                                 | 5 files      | For searchable/multi-select, use `AutoComplete` instead.                                                      |
| `Calendar`           | Date-only picker (MUI X)                                                                          | `format`, `minDate`                                                     | 4 files      | Pair with `TimePicker`, or use `DateTimePicker` for one combined control.                                     |
| `Captcha`            | HOC wrapping a component's `onClick` with reCAPTCHA v3 verification                               | `component`, `action`                                                   | 4 files      | Not a visual component — a verification wrapper (login/registration).                                         |
| `EmojiInput`         | `Editor` (Lexical rich text) + emoji-picker adornment                                             | `handleChange`, `rows`                                                  | 4 files      | For plain rich text without emoji, the underlying `Editor` has no other external consumers today.             |
| `TileSelector`       | Row/grid of selectable tiles (pill/icon/radio-card variants)                                      | `options`, `variant`, `selected`                                        | 3 files      | Newer addition — good candidate for reuse instead of ad hoc button-row selectors.                             |
| `CreateAutoComplete` | `AutoComplete` preconfigured to create a new Tag inline via `CREATE_LABEL`                        | extends `AutoComplete` props                                            | 3 files      | Tag-picker-with-create-inline only; use plain `AutoComplete` + your own `handleCreateItem` for anything else. |
| `TimePicker`         | Time-only picker (MUI X)                                                                          | `placeholder`, `helperText`                                             | 2 files      |                                                                                                               |
| `DateTimePicker`     | Combined date+time picker (MUI X, UTC-aware)                                                      | `format`, `minDate`                                                     | 1 file       | Low usage — check before building separate `Calendar`+`TimePicker` pairs elsewhere.                           |
| `RangeSlider`        | Slider paired with a synced number box for a bounded numeric value                                | `value` (`number \| ''`), `min`, `max`, `step`, `onChange`, `onClear`, `disabled` | 1 file       | **Not Formik-integrated** — controlled through `value`/`onChange`. Pass `value=''` for "unset": the box renders empty and the slider rests at `min`. |
| `RadioInput`         | Yes/No boolean radio pair                                                                         | `labelYes`, `labelNo`, `row`                                            | 1 file       | Low usage — `Checkbox` may be the more common boolean pattern; confirm intent before adding more.             |
| `InlineInput`        | Standalone (non-Formik) inline-edit-in-place text field                                           | `value`, `callback`                                                     | 1 file       | Niche — one-off rename/edit-in-place UX outside a Formik form.                                                |
| `WhatsAppEditor`     | Lexical plain-text chat composer with WhatsApp-style formatting shortcuts                         | `sendMessage`, `readOnly`                                               | 1 file       | Specific to the chat composer — not a general rich-text field.                                                |

---

## Known gaps / deprecation candidates

- **`MessageDialog`** has zero real consumers — a deprecation candidate; confirm with the
  team before deleting.
- **Media upload** has no shared component/hook yet (`useMediaUpload` + upload field).
  `CsvUpload` and `ImportButton` exist but are narrower (CSV-only / read-as-text-only),
  not a general upload primitive.
- **Component API conventions** (prop naming, `data-testid` policy, ref forwarding,
  `className` passthrough) aren't documented yet.
