# Contributing to Aggie

Aggie development work is mainly coordinated on a private redmine instance. Contact
@hooverlunch or another maintainer to get access. Using the github issue tracker is
also acceptable.

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
`locale-en.json` as `"translation_id": "your string"`. Strings can include 

To show your string, you can then just use its translation ID and pass it
through the [angular translate filter]
(https://angular-translate.github.io/docs/#/guide/04_using-translate-filter) 
e.g.,  `placeholder="{{'Enter title' | translate}}"`, or 
[directive](https://angular-translate.github.io/docs/#/guide/05_using-translate-directive), 
e.g., `<button translate>Go</button>`. If your strings needs to display 
interpolated values, as in `Password must be at least {{passwordMinLength}} characters`,
you can use the translate angular directive together with the translate-value directive as in:
``translate="password_min_length" translate-value-passwordMinLength="{{passwordMinLength}}">``

To check that your string is being translated correctly, run the app and execute
the following in the browser console to switch the language to `debug`:

```js
angular.element(document.querySelector('html')).injector().get('$translate').use('debug').then((x) => { console.log(x)})
```

The new string, and all the other strings, should change to the translation ID
and be displayed _ALL_CAPS_UNDERSCORE_DELIMITED, plus any interpolated
parameters found in the input strings, e.g., `_SHORT_DESCRIPTION_OF_YOUR_STRING`.


### Supporting more languages

To add translations for another language, just add a `locale-foo.json` file,
where `foo` is your locale to `public/angular/translations/` and
`lib/translations`. Get a list of keys from `locale-debug.json` to know what to
support.
