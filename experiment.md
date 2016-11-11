Experimental feature for Aggie
==============================

To allow for controlled experiments and evaluation of Aggie, we have developed
a content service that will replay the reports found in a json file.

Reports will be "replayed" with the same cadence than in the original 
"recording". To set up and save a recording

1. Start Aggie normally with the sources you want to record.
2. Set fetching off when you want to finish your recording
3. Dump the sources `mongodump --db aggie --collection sources`
4. Export the reports collections to a json file e.g. `dump.json`.
   `mongoexport --db aggie --collection reports --out reports_dump.json`

To play a recording:
1. Set fetching off
1. Stop Aggie
1. Drop sources, incidents, reports. Drop other collections if not needed in your experiment
1. Extract the reports from the json file that you want to replay. Usually the XXX last ones.
   `tail -nXXX reports_dump.json > reports.json`
   The rest of the reports you can either import them to the mongodb or discard them,
   depending on your experiment.
   `head --lines=-XXX reports_dump.json > reports_old.json`
   `mongoimport --db aggie --collection reports --file reports_old.json`
1. Set the experimental variables of `secrets.json`: `experiment` to `true` 
   and point `experimentFile` variable to where the json file is, relative to the Aggie folder.
1. Restore the sources dump to the database.
   `mongorestore --db aggie --collection sources dump/aggie/sources.bson`
1. Start Aggie
1. Set fetching on
1. We are now replaying `reports.json`
