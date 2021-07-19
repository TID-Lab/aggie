angular.module('Aggie')

.value('mediaOptions', ['twitter', 'rss', 'elmo', 'smsgh', 'whatsapp', 'facebook', 'instagram', 'comments' , 'telegram'])

.value('apiSettingsOptions', ['twitter', 'elmo', 'gplaces', 'crowdtangle'])

.value('widgetSettingsOptions', ['incident map'])

.value('statusOptions', ['Read', 'Unread'])

.value('linkedtoIncidentOptions', [{ _id: 'any', title: '* Any Group' },
                                   { _id: 'none', title: '* Not in any Group' }])


.value('userRoles', ['viewer', 'monitor', 'admin'])

.value('credentialsTypes', ['crowdtangle', 'twitter', 'telegram'])

.value('incidentStatusOptions', ['open', 'closed'])

.value('veracityOptions', ['unconfirmed', 'confirmed true', 'confirmed false'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('publicOptions', ['public', 'private'])

// Note: This should be the same as PAGE_LIMIT in database.js.
.value('paginationOptions', { perPage: 25 })

.value('emailTransportOptions', {
  SES: ['accessKeyId', 'secretAccessKey', 'region'],
  SMTP: ['host', 'port', 'secure', 'user', 'pass'],
  SendGrid: ['apiKey']
})

.value('matomoConfig', {
  "enabled": false,
  "dashboard_name": "my-aggie",
  "cookie_domain": "*.aggie.example.org",
  "site_id": "1",
  "container_id": "container-id"
})
