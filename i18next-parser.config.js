module.exports = {
  createOldCatalogs: false, // save previous translation catalogs to the \_old folder

  lexers: {
    ts: ['JavascriptLexer'],
    tsx: ['JsxLexer'],
    default: ['JavascriptLexer'],
  },

  locales: ['en'],
  // An array of the locales in your applications

  namespaceSeparator: false,
  // Namespace separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.
  keySeparator: false,

  useKeysAsDefaultValue: true,

  output: 'src/i18n/$LOCALE/$LOCALE.json',
  // Supports $LOCALE and $NAMESPACE injection
  // Supports JSON (.json) and YAML (.yml) file formats
  // Where to write the locale files relative to process.cwd()

  input: ['src/**/*.tsx', 'src/**/*.ts'],
  // An array of globs that describe where to look for source files
  // relative to the location of the configuration file
  // Globs syntax: https://github.com/isaacs/node-glob#glob-primer
};
