# HSM Design-to-Code Patterns

Patterns specific to implementing the HSM Templates UI from hi-fi mockups.

## Component Hierarchy — always prefer existing over raw HTML

- `Input` from `components/UI/Form/Input/Input` instead of `<input>` or `<textarea>`. Its `onChange` receives a **string value**, not a DOM event: `onChange={(val: string) => ...}`
- `Button` from `components/UI/Form/Button/Button` instead of `<button>`
- `AutoComplete` from `components/UI/Form/AutoComplete/AutoComplete` for dropdowns — has **no `label` prop**, render a `<label>` manually above it
- `CreateAutoComplete` extends `AutocompleteProps` — same props, adds create-option support
- `EmojiInput` for rich-text message body (provides Lexical editor with B/I/S, emoji). Its `defaultValue` is not in the TypeScript interface — pass it via spread with `as any`:
  ```tsx
  {...(initialValue ? ({ defaultValue: initialValue } as any) : {})}
  ```

## Formik in custom forms

- Use `useFormik` + `FormikProvider` (not the `<Formik>` render-prop component) when you need Formik context accessible to child components like `TemplateOptions` (which uses `FieldArray` with `name="templateButtons"` internally).
- `templateButtons` must be a field in Formik's `initialValues` for `FieldArray` to work.

## Lexical / EmojiInput requirement

Both `EmojiInput` and `TemplateVariables` call `useLexicalComposerContext()` and will crash without a provider. Wrap them in `LexicalWrapper` from `common/LexicalWrapper`:
```tsx
<LexicalWrapper>
  <EmojiInput ... />
  <TemplateVariables ... />
</LexicalWrapper>
```
`FormLayout` does this internally; custom form pages must do it manually.

## Translation / i18n — add strings BEFORE using `t()`

`t()` from `i18next` is strictly typed against the exact keys in `src/i18n/en/en.json`. Using a string not yet in the file causes a **TypeScript compile error**, not a runtime warning. Workflow:
1. Add every new string to `src/i18n/en/en.json` and `src/i18n/hi/hi.json`
2. Then use `t('your new string')` in the component

**Never use `t()` inside Yup validation schemas** — the TypeScript overloads don't match Yup's `required(message: string)` signature. Use plain string literals instead:
```ts
// ✅ correct
body: Yup.string().required('Message is required.')
// ❌ TypeScript error
body: Yup.string().required(t('Message is required.'))
```

## `useRef` for timers

Type debounce refs explicitly to avoid TypeScript errors:
```ts
const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
```

## Shortcode / slug availability pattern

Use `useLazyQuery` + a 300 ms debounce + a `'idle' | 'checking' | 'available' | 'taken'` status state. Clear the debounce timer on every keystroke and only fire the query after the pause:
```ts
clearTimeout(debounceRef.current);
setShortcodeStatus('checking');
debounceRef.current = setTimeout(async () => { /* fire query */ }, 300);
```

## Custom design tokens

When matching the Glific green design system in CSS Modules:
- Primary green: `#119656`
- Hover green: `#0d7a44`
- Light green tint: `#f0faf5`
- Border default: `#d1d5db`
- Text primary: `#111827`
- Text secondary: `#6b7280`
- Error red: `#ef4444`
