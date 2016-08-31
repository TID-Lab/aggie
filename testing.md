Manual End-to-end Testing
=========================

Internationalization
--------------------

1. Do all of the tests below after running

```js
angular.element(document.querySelector('html')).injector().get('$translate').use('debug').then((x) => { console.log(x)})
```

[all constant string should appear in `__ALL_CAPS`]

Logging in
----------

1. Drop aggie database and run `npm install`
2. Log in as `admin` with default password [goes to `/reset_admin_password`]
3. Reset admin password [goes to `/reports`]

Sources and fetching
--------------------

1. Add Facebook API token and turn fetching on
2. Create Facebook source `https://www.facebook.com/nytimes` [at least 50
reports show up, and no warnings]
3. Create Facebook source `https://www.facebook.com/err102398-023894-1239084`
[this source gets an error and appears as `OFF` in `/sources`]

Incidents
---------

1. With at least a few reports and no incidents, go to `/reports`.
2. Click `Add` in the incident column of one of the reports [modal appears
suggesting you create a new incident]
3. Click `create a new incident` [create incident modal appears]
4. Add a title for the incident
5. Begin typing `mac` in the location field [locations starting with `mac`
should be suggested]
6. Select a location and save the incident [modal closes]
7. Select 3 reports with the checkboxes and click `Add to incident` [modal opens
with the previously created incident]
8. Add the reports to that incident [incident column updates]
9. Go to `/incidents` [in `Title` column incident shows correct number of
reports]
10. Click `Create Incident` [modal appears]
11. Begin typing `mac` in the location field [locations starting with `mac`
should be suggested]
12. Pick a a location, enter a title and save the incident [incident is saved successfully]

Users and emails
----------------

1. Go to Settings > Settings [goes to `/settings`]
2. Set app email address [saved successfully]
3. Set up email transport settings [saved successfully]
4. Go to Settings > Users [list of users is shown]
5. Click Create User [modal appears]
6. Select name, a valid email, and `Viewer` [possible roles are listed correctly]
7. Submit [email is sent]
8. Logout
9. Click link in email [goes to `/choose_password/...`]
10. Select new password and login
11. Click Settings [Users and not Settings appears in dropdown]
12. Go to Settings > Users [only this user appears, cannot create new users]
