angular.module('Aggie')

.value('mediaOptions', ['twitter', 'facebook', 'rss', 'elmo', 'smsgh', 'whatsapp'])

.value('apiSettingsOptions', ['twitter', 'facebook', 'elmo', 'gplaces'])

.value('widgetSettingsOptions', ['incident map'])

.value('statusOptions', ['Read', 'Unread', 'Flagged', 'Unflagged', 'Read & Unflagged'])

.value('linkedtoIncidentOptions', [{ _id: 'any', title: '* Any Incident' },
                                   { _id: 'none', title: '* Without Incident' }])

.value('userRoles', ['viewer', 'monitor', 'admin'])

.value('incidentStatusOptions', ['open', 'closed'])

.value('veracityOptions', ['unconfirmed', 'confirmed true', 'confirmed false'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('publicOptions', ['public', 'private'])

.value('paginationOptions', { perPage: 25 })

.value('emailTransportOptions', {
  SES: ['accessKeyId', 'secretAccessKey', 'region'],
  SMTP: ['host', 'port', 'secure', 'user', 'pass'],
  SendGrid: ['api_key'] });

