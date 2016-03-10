angular.module('Aggie')

.value('mediaOptions', ['twitter', 'facebook', 'rss', 'elmo'])

.value('mediaSettingsOptions', ['twitter', 'facebook', 'elmo'])

.value('statusOptions', ['Read', 'Unread', 'Flagged', 'Unflagged', 'Read & Unflagged'])

.value('linkedtoIncidentOptions', [{ _id: 'any', title: '* Any Incident' }, { _id: 'none', title: '* Without Incident' }])

.value('userRoles', ['viewer', 'monitor', 'manager', 'admin'])

.value('incidentStatusOptions', ['open', 'closed'])

.value('veracityOptions', ['unconfirmed', 'confirmed true', 'confirmed false'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('paginationOptions', { perPage: 25 })

.value('emailTransportOptions', [
  { method: 'SES', settingNames: ['AWSAccessKeyID', 'AWSSecretKey']},
  { method: 'SMTP', settingNames: ['host', 'port', 'secure', 'auth:user', 'auth:pass']},
  { method: 'SendGrid', settingNames: ['auth:api_key'] } ]);

