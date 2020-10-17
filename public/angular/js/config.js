angular.module('Aggie')

.value('mediaOptions', ['twitter', 'rss', 'elmo', 'smsgh', 'whatsapp', 'crowdtangle', 'comments'])

.value('apiSettingsOptions', ['twitter', 'elmo', 'gplaces', 'crowdtangle'])

.value('widgetSettingsOptions', ['incident map'])

.value('statusOptions', ['Read', 'Unread', 'Flagged', 'Unflagged', 'Read & Unflagged'])

.value('linkedtoIncidentOptions', [{ _id: 'any', title: '* Any Incident' },
                                   { _id: 'none', title: '* Without Incident' }])

.value('userRoles', ['viewer', 'monitor', 'admin'])

.value('incidentStatusOptions', ['open', 'closed'])

.value('veracityOptions', ['unconfirmed', 'confirmed true', 'confirmed false'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('publicOptions', ['public', 'private'])

// Note: This should be the same as PAGE_LIMIT in database.js.
.value('paginationOptions', { perPage: 25 })

.value('emailTransportOptions', {
  SES: ['accessKeyId', 'secretAccessKey', 'region'],
  SMTP: ['host', 'port', 'secure', 'user', 'pass'],
  SendGrid: ['apiKey'] });

