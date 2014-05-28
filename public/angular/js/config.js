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

.value('paginationOptions', {
  perPage: 25
});
