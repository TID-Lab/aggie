Manual End-to-end Testing
=========================

Prerequisites
-------------

1. Use default `secrets.json`, but set `adminParty` to false
2. Run Aggie with `npm start`

Internationalization
--------------------

1. Do all of the tests below after running

```js
angular.element(document.querySelector('html')).injector().get('$translate').use('debug').then((x) => { console.log(x)})
```

[all constant string should appear in `__ALL_CAPS`]

User Activity Logging
---------------------

1. Do all of the below with `api.log_user_activity: true` in `config/secrets.json`.

Logging in
----------

1. Make sure `adminParty` is false
2. Drop aggie database and run `npm install`
3. Log in as `admin` with default password [goes to `/reset_admin_password`]
4. Reset admin password [goes to `/login`]
5. Log in with new password

Sources, APIs, and fetching
--------------------

1. Add Google Places API and refresh the page
2. Add Facebook API token and turn fetching on
3. Create Facebook source `https://www.facebook.com/nytimes` [at least 50
reports show up, and no warnings]
4. Create Facebook source `https://www.facebook.com/err102398-023894-1239084`
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
10. View the incident you have just created [incident shows the 3 reports that were added]
11. Click the `Edit` button [edit modal appears]
12. Add one tag and save the incident [incident is updated]
13. Flag one report in the incident view page [the report is flagged]
14. Click `Create Incident` [modal appears]
15. Begin typing `mac` in the location field [locations starting with `mac`
should be suggested]
16. Pick a a location, enter a title and save the incident [incident is saved successfully]


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

Batches
-------

Prerequisites: at least 1 incident, 2 users, and 21 reports.
1. With at least 11 reports and at least 1 incident, go to `reports` and click
`Grab Batch` [goes to /reports/batch]
2. Click `Add` in the incident column of one report [modal appears showing
the incidents already created]
3. Click an incident [modal closes, text `Add` is updated to the name of the
incident]
4. Click `Mark All and Done` [goes back to /reports and the reports from the
batch are marked as read]
5. Navigate to `/reports/batch` [the previous batch is displayed, and the
reports are marked as read]
6. Navigate to `/reports` and click `Grab Batch` again [goes to `/reports/batch`
and populates with some reports]
7. Log in as a different user in a different tab/window
8. Navigate to `/reports` as the second user and click `Grab Batch`. [reports
are populated, and none of them are reports the other user has in their batch]

Experimental feature
------------
See experiment.md

Prerequisites:
1. Set secrets.json variables: `"experimental": true`, and `"experimentFile": "test/end_to_end/fixtures/experiment_reports.json"`
2. Set fetching off
3. Stop Aggie
Start "experiment"
1. Start Aggie
1. Set fetching on
1. Navigate to `/reports` [50 reports have appeared on the page, the last one with a
bit of delay]
