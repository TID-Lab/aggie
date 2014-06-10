angular.module('Aggie')

.value('sourceTypes', {
  'twitter': 'Twitter',
  // 'facebook': 'Facebook',
  'rss': 'RSS',
  // 'elmo': 'Elmo'
})

.value('statusOptions', {
  'relevant': 'Relevant',
  'irrelevant': 'Irrelevant',
  'unassigned': 'Unassigned',
  'assigned': 'Assigned'
})

.value('incidentStatusOptions', {
  'new': 'New',
  'working': 'Working',
  'alert': 'Alert',
  'closed': 'Closed'
})

.value('veracityOptions', {
  'true': 'Verified',
  'false': 'Unverified'
})

.value('paginationOptions', {
  perPage: 25
});
