# Contributing to Aggie

Please create separate branches for any bug fixes/features that cannot be
considered trivial. For trivial bug fixes/features, commit directly to develop.

## Translations

The main translation files are in `public/angular/translations/` and
`lib/translations/` named `locale-*.json`. `locale-debug.json` (generated
automatically by `gulp debugTranslations` contains all strings that have
translations in any of the other languages. In addition, the text of emails that
Aggie sends is in `lib/mailer.js`, for all languages.

### Displaying strings

When adding a new string that will be shown on the app, give the translation a
translation ID (possibly the string itself). Then include this string in
`locale-en.json` as `"translation_id": "your string"`.

To show your string, you can then just use your translation ID and pass it
through the [angular translate filter](https://angular-translate.github.io/docs/#/guide/04_using-translate-filter)
or [directive](https://angular-translate.github.io/docs/#/guide/05_using-translate-directive).
To check that your string is being translated correctly, run the app and execute
the following in the browser console to switch the language to `debug`:

```js
angular.element(document.querySelector('html')).injector().get('$translate').use('debug').then((x) => { console.log(x)})
```

Your string should immediately be replaced by "SHORT DESCRIPTION OF YOUR STRING".


### Supporting more languages

To add translations for another language, just add a `locale-foo.json` file,
where `foo` is your locale to `public/angular/translations/` and
`lib/translations`. Get a list of keys from `locale-debug.json` to know what to
support.
