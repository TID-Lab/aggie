Experimental feature for Aggie
==============================

To allow for controlled experiments and evaluation of Aggie, we have developed
a content service that will replay the reports found in a json file.

Reports will be "replayed" with the same cadence than in the original
"recording". To set up and save a recording

1. Start Aggie normally with the sources you want to record.
2. Set fetching off when you want to finish your recording.
3. Dump the sources `mongodump --db aggie --collection sources` as we need to use the same mongoDB's `_id`.
4. Export the reports you want to replay to a json file for the time range you want e.g:
`mongoexport --db aggie -c reports -q '{storedAt: { "$gt": {"$date" : "2016-11-14T03:54:26.130Z"}, "$lt": {"$date" : "2016-11-14T03:54:30.130Z"}}}' --sort '{storedAt: 1}' --sort '{storedAt: 1}' > reports.json`
5. Export the previous reports:
`mongoexport --db aggie -c reports -q '{storedAt: { "$lte": {"$date" : "2016-11-14T03:54:26.130Z"}}}' --sort '{storedAt: 1}' > previous_reports.json`

To play a recording:

1. Set fetching off
1. Stop Aggie.
1. Drop sources, incidents, reports. Drop other collections if not needed in your experiment.
1. Load previous reports if needed:
   `mongoimport --db aggie --collection reports --file previous_reports.json`
1. Set the experimental variables of `secrets.json`: `experiment` to `true`
   and point `experimentFile` variable to where the json file is, relative to the Aggie folder.
1. Restore the sources dump to the database:
   `mongorestore --db aggie --collection sources dump/aggie/sources.bson`
1. Start Aggie.
1. Set fetching on.
1. We are now replaying `reports.json`.
