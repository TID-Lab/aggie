angular.module('Aggie')

.value('sourceTypes', ['twitter', 'rss'])

.value('statusOptions', ['relevant', 'irrelevant', 'unassigned', 'assigned'])

.value('userRoles', ['viewer', 'monitor', 'manager', 'admin'])

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
