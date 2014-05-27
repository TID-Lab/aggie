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

.value('userRoles', {
  'viewer': 'Viewer',
  'monitor': 'Monitor',
  'manager': 'Manager',
  'admin': 'Admin'
})

.value('paginationOptions', {
  perPage: 25
});
